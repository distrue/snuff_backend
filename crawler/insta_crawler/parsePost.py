from bs4 import BeautifulSoup
from time import sleep

def get_Name_Content(soup, arr_name, arr_content):
    comment_tag = soup.select('body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > div > li > div > div > div.C4VMK > span')
    comment = str(comment_tag[0]).replace("<br/>", "\n")
    comment = comment.replace("—", "\n$$", 1)
    comment = comment.replace("—", "")
    arr_name_and_content = comment.split("\n$$")    #식당 제목과 리뷰내용 분리
    print(arr_name_and_content[0])
    if(len(arr_name_and_content) < 2):
        return False
    arr_name.append(arr_name_and_content[0].replace("<span>", "").replace('<span title="수정됨">', ''))
    arr_content.append(arr_name_and_content[1].replace("</span>", ""))
    print(arr_name_and_content[0].replace("<span>", "").replace('<span title="수정됨">', ''))
    return True

def get_LikeNum(soup, arr_likeNum):
    likeNum_tag = soup.select('body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > section.EDfFK.ygqzn > div > div > button > span')
    likeNum = int(likeNum_tag[0].text.replace(",",""))
    arr_likeNum.append(likeNum)

def get_CommentNum(soup, arr_commentNum):
    commentNum_tag = soup.select('body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > ul')
    commentNum = len(commentNum_tag)
    arr_commentNum.append(commentNum)
    