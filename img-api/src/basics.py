from datetime import datetime, timedelta
import pytz
from src.config import PICKING_TIME


def get_cur_time(no_sec = False):
    taiwan_tz = pytz.timezone('Asia/Taipei')
    current_datetime = datetime.now(taiwan_tz)
    if no_sec:
        cur_time_pure_number = current_datetime.strftime("%Y-%m-%dT%H:%M")
    else:
        cur_time_pure_number = current_datetime.strftime("%Y-%m-%dT%H:%M:%S")
    return cur_time_pure_number

def pure_number_to_formatted(pure_number):
    dt = datetime.strptime(pure_number, "%Y-%m-%dT%H:%M:%S")
    return dt.strftime("%Y-%m-%d %H:%M:%S")

def formatted_to_date(formatted_time):
    taiwan_tz = pytz.timezone('Asia/Taipei')
    return taiwan_tz.localize(datetime.strptime(str(formatted_time), "%Y-%m-%dT%H:%M"))

def get_picking_date(date_str):
    dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S")
    # 定义下午四点
    set_time = dt.replace(
        hour=PICKING_TIME['hour'],
        minute=PICKING_TIME['minute'],
        second=PICKING_TIME['second'],
        microsecond=0
    )

    # 比较输入的datetime对象的时间部分
    if dt > set_time:
        # 超过下午四点，返回隔天日期
        next_day = dt + timedelta(days=1)
        return next_day.date()
    else:
        # 未超过下午四点，返回当天日期
        return dt.date()