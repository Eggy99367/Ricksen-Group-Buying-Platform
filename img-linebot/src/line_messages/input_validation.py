import re

def isEmail(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return re.match(pattern, email) is not None

def isPhoneNum(phone_num):
    if isInteger(phone_num):
        pattern = r'^09\d{8}$'
        return re.match(pattern, phone_num) is not None

def isInteger(number):
    try:
        int(number)
        return True
    except ValueError:
        return False
    
def isInRange(quantity, mn, mx):
    if int(quantity) <= int(mx) and int(quantity) >= int(mn):
        return True
    return False

if __name__ == "__main__":
    print(isEmail("yinhsuac@uci.edu"))
    print(isEmail("yinhsuac.uci.edu"))
    print(isEmail("@uci.edu"))
    print(isPhoneNum("0961058028"))
    print(isPhoneNum("096105808"))
    print(isPhoneNum("0861058028"))
    print(isInteger("10"))
    print(isInteger("1.0"))
    print(isInteger("1個"))