import React, { useState, useEffect, useRef } from 'react';
import { Header, ListContainer } from "../../components"
import { SearchBar } from "./searchBar"
import axios from 'axios';
import API_BASE_URL from '../../config';
import { useNavigate } from 'react-router-dom';

export const Analysis = () => {
    
    const initialSearchBarContents = 
    {
        "showed_attr": "團購",
        "attr": "id",
        "required": true,
        "display": true,
        "data": null,
        "special": "id",
        "options": {}
    };

    const initialContents = 
    [
        {
            "showed_attr": "編號",
            "attr": "id",
            "required": true,
            "display": true,
            "data": null,
            "special": null,
            "options": {}
        },
        {
            "showed_attr": "商品",
            "attr": "product_id",
            "required": true,
            "display": true,
            "data": null,
            "special": "product_name",
            "options": {}
        },
        {
            "showed_attr": "狀態",
            "attr": "status",
            "required": true,
            "display": true,
            "data": null,
            "special": null,
            "options": [["尚未開團", ""], ["團購進行中", ""], ["成團", ""], ["棄團", ""]]
        }
    ]

    const navigate = useNavigate();

    const [searchContents, setSearchContents] = useState(initialSearchBarContents);
    const [contents, setContents] = useState(initialContents);
    const [groups, setGroups] = useState([]);
    const [selectedRow, setSelectedRow] = useState(null);
    const [page, setPage] = useState(0);
    const [resultLimit, setResultLimit] = useState(25);
    const listContainerRef = useRef(null);
    const [groupIds, setGroupIds] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);


    var grp_last_updated = null;

    const checkUpdate = async () => {
        console.log("checking for update...");
        axios.get(`${API_BASE_URL}/db/last_updated/groups`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
          var time = response.data.time.replace(/[^0-9]/g, '')
          if(grp_last_updated === null || time > grp_last_updated){
            grp_last_updated = time;
            fetchAllGroupIds();
            const ids = response.data.map(group => group.id);
            setGroupIds(ids);
            console.log(groupIds);
            setError(null);
          }
          setError(false);
          setLoading(false);
        }).catch(error => {
          console.error("There was an error fetching the data!", error);
          setError(error);
        });
      }

    useEffect(() => {
        checkUpdate();
        const interval = setInterval(() => {
          checkUpdate();
        }, 3000);
        return () => clearInterval(interval);
      }, []);

    useEffect(() => {
        if (groupIds.length > 0) {
            setSearchContents(prevContents => ({
                ...prevContents,
                options: groupIds
            }));
        }
    }, [groupIds]);
    //-------------------------------------------------------------------------
    const handleInputChange = async (value) => {
        setSearchTerm(value);
        console.log(searchTerm);
    }

    const handleInvestigateClick = (index) => {
        navigate('/investigate', { state: { group: groups[index] } });
    }

    const fetchAllGroupIds = async () => {
        console.log("Fetching data from API...");
        axios.get(`${API_BASE_URL}/db/groups`, {
          headers: {
            "ngrok-skip-browser-warning": 1
          }
        }).then(response => {
            console.log("Data fetched successfully:", response);
            const filteredGroups = response.data.map(group => ({
                id: group.id,
                product_id: group.product_id,
                status: group.status,
                product_name: group.product_name
            }));
            console.log(filteredGroups);
            setGroups(filteredGroups);
            setGroupIds(response.data.map(group => group.id));
            setLoading(false);
            setError(null);
          }).catch(error => {
            console.error("There was an error fetching the data!", error);
            setError(error);
            setLoading(false);
        });
      }
    //-------------------------------------------------------------------------

    const filteredContents = groups.filter((group) => (
        searchTerm === "" ? (true) : (
            Object.entries(group).some(([key, value]) =>
              contents.some(content => content.display && content.attr === key) && value && value.toString().toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        )
      );

    const handleRowClick = (index) => {
        setSelectedRow(index);
    }
    useEffect(() => {
        if (listContainerRef.current) {
          const containerHeight = listContainerRef.current.clientHeight - 90;
          const rowHeight = listContainerRef.current.querySelector('tr').clientHeight + 1;
          const rowsPerPage = Math.floor(containerHeight / rowHeight);
          setResultLimit(rowsPerPage);
        }
      }, [listContainerRef, groups, searchTerm]);

    return (
        <div className='page_main_box'>
            <Header />
            <div className='page_content'>
                <SearchBar 
                    data = {searchContents}
                    handleInputChange = {handleInputChange}
                    selectedRow = {selectedRow}
                    handleInvestigateClick = {handleInvestigateClick}
                />
                <ListContainer 
                    contents = {contents}
                    filteredContents = {filteredContents}
                    handleRowClick = {handleRowClick}
                    selectedRow = {selectedRow}
                    page = {page}
                    setPage = {setPage}
                    result_limit = {resultLimit}
                    error = {error}
                    loading = {loading}
                    listContainerRef = {listContainerRef}
                />
            </div>
        </div>
    );
}

export default Analysis;