from datetime import datetime
import pytz

def get_cur_time():
    taiwan_tz = pytz.timezone('Asia/Taipei')
    current_datetime = datetime.now(taiwan_tz)
    cur_time_pure_number = current_datetime.strftime("%Y%m%d%H%M%S")
    return cur_time_pure_number

def pure_number_to_formatted(pure_number):
    dt = datetime.strptime(pure_number, "%Y%m%d%H%M%S")
    return dt.strftime("%Y-%m-%d %H:%M:%S")