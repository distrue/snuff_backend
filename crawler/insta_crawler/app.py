from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

import requests
from bs4 import BeautifulSoup
from time import sleep

import os
import platform
import pandas as pd
import re

from . import tracer as tc
from . import parsePost

class SnuffCrawl:
    def __init__(self, num, *args):
        self.num = num
        self.cut = 1
        self.looked = []
        self.ROOT_PATH = os.path.abspath(os.path.dirname(__file__))
        self.error_page = []
        self.error_reason = []
        self.Reviews_dataframe = pd.DataFrame()
        if(platform.system() == 'Darwin'):
            self.DRIVER_PATH = os.path.join(self.ROOT_PATH, '..', 'webdriver', 'chromedriver_mac')
        elif(platform.system() == "Windows"):
            self.DRIVER_PATH = os.path.join(self.ROOT_PATH, '..', 'webdriver', 'chromedriver.exe')
        self.driver = webdriver.Chrome(executable_path=self.DRIVER_PATH)

        #--- instagram : snu_food_fighter Review Collector ---#
        self.driver.get('https://www.instagram.com/snu_foodfighter/')
        self.wait = WebDriverWait(self.driver, 30)
        sleep(1)
        self.initialized = True
        
        self.listsoup = BeautifulSoup(self.driver.page_source, 'html.parser')
        x = self.listsoup.select("body > span > section > main > div > div._2z6nI > article > div")
        self.now_mlen = len(x[0].select("div > div.Nnq7C")) * 3
        self.now_line = 1
        self.now_row = 0
        self.last_page = False
        self.recorded = 1 

        self.excluded = pd.DataFrame(columns=["page"])
        self.only = pd.DataFrame(columns=["page"])
        self.isOnly = False
        for item in args[0]:
            print(item)
            if(item.split('=')[0] == 'exclude'):
                try:
                    self.excluded = pd.read_csv(item.split('=')[1])
                except Exception as E:
                    print("Exclusion failed", E)
            if(item.split('=')[0] == 'only_URL'):
                try:
                    self.isOnly = "URL"
                    self.only = pd.read_csv(item.split('=')[1])["page"].values
                except Exception as E:
                    print("OnlyMode failed", E)
 
    def scroll_down_post(self, force=False):
        if(force == False):
            if( (self.now_line - 1) * 3 + self.now_row <= self.now_mlen ):
                return
            if(self.last_page == True):
                return "Finish"
        print("Scroll down Started")
        self.cut += 1
        element = self.wait.until(EC.presence_of_element_located((By.XPATH, "//article[@class='FyNDV']")))
        try:
            k_post = self.driver.find_element_by_xpath("//article / div[@class='_4emnV']") # loading bar
            self.driver.execute_script("arguments[0].scrollIntoView(true);", k_post)
            self.driver.implicitly_wait(3)
            print("Scroll wait finished")
            self.now_line = 1
            self.now_row = 1
        except Exception:
            print("Scroll ended")
            self.driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
            self.last_page = True
            self.listsoup = BeautifulSoup(self.driver.page_source, 'html.parser')
            x = self.listsoup.select("body > span > section > main > div > div._2z6nI > article > div")
            self.now_mlen = len(x[0].select("div > div.Nnq7C")) * 3
            self.now_line = 1
            self.now_row = 1
            return
        try:
            self.listsoup = BeautifulSoup(self.driver.page_source, 'html.parser')
            x = self.listsoup.select("body > span > section > main > div > div._2z6nI > article > div")
            self.now_mlen = len(x[0].select("div > div.Nnq7C")) * 3
            print("Loaded list size: ", self.now_mlen)
        except Exception as E:
            print("Unintended Error occured on counting posts", E)
  
    def get_category(self, soup, arr_region, arr_foodtype):
        hashtags = []
        try:
            while(True):
                comment_plus = soup.select("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > li")
                self.driver.find_element_by_xpath("//span[@class='glyphsSpriteCircle_add__outline__24__grey_9 u-__7']").click()
                sleep(0.3)
        except Exception as E:
            print("stop loading comments by icon", E)
        try:
            while(True):
                comment_plus = soup.select("body > div._2dDPU.vCf6V > div.zZYga > div > article > div.eo2As > div.EtaWk > ul > li")
                self.driver.find_element_by_xpath("//button[@class='Z4IfV']").click()
                sleep(0.3)
        except Exception as E:
            print("stop loading comments by button", E)
        soup = BeautifulSoup(self.driver.page_source, 'html.parser')

        comment_tag = soup.find_all("ul", "Mr508")
        for comment in comment_tag:
            if(comment.find('h3', class_='_6lAjh').find('a').get('title') == 'snu_foodfighter'):
                print(comment)
                for nspan in comment.find_all('span'):
                    try:
                        for tags in nspan.find_all('a'):
                            if(len(tags.text.split('_')) >= 2):
                                hashtags.append(tags.text.split('_')[1])
                    except:
                        print("cannot parse")
        print(hashtags)
        for can in hashtags:
            if(can in ["양식", "중식", "한식", "알콜", "특이식", "일식", "카페"]):
                arr_foodtype.append(can)
            if(can in ["샤로수길", "낙성대", "서울대학교", "녹두", "신림", "봉천", "서울대입구역", "사당"]):
                arr_region.append(can)

    def get_ImgUrls(self, arr_imgUrls):
        element = self.wait.until(EC.presence_of_all_elements_located((By.XPATH, "//ul[@class='YlNGR']/li[@class='_-1_m6']")))
        sleep(0.1)
        soup = BeautifulSoup(self.driver.page_source, 'html.parser')
        selector_list = soup.select('body > div._2dDPU.vCf6V > div.zZYga > div.PdwC2._6oveC.Z_y-9 > article > div._97aPb > div.rQDP3 > div.pR7Pc > div.tN4sQ.zRsZI > div.NgKI_ > div.MreMs > div.qqm6D > ul.YlNGR > li')
        img_len = len(selector_list)
        print("pict_url len:", img_len)

        imgUrls_element = []
        i = 1
        url_selector_detail = 'body > div._2dDPU.vCf6V > div.zZYga > div.PdwC2._6oveC.Z_y-9 > article > div._97aPb > div.rQDP3 > div.pR7Pc > div.tN4sQ.zRsZI > div > div > div > ul > li'
        _soup = False
        detail = False
        print("Image (all: " + str(img_len) + "): ", end="")
        while(i <= img_len) :
            try:
                element = self.wait.until(EC.presence_of_element_located((By.XPATH, "//ul[@class='YlNGR']/li[@class='_-1_m6'][" + str(i) + "]//img"))) # /div.KL4Bh
                sleep(0.1)
                print(i, ">", end=" ")
                soup = BeautifulSoup(self.driver.page_source, 'html.parser')
                detail = soup.select(url_selector_detail)
                imgUrls_element.append(detail[i-1].find('img').get('src'))
            except Exception as E:
                print("Img record error", E)
            i += 1
            if(i!=img_len):
                element = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@class='  _6CZji']")))
                self.driver.find_element_by_xpath("//button[@class='  _6CZji']").click()
        print()
        arr_imgUrls.append(imgUrls_element)

    def load_post(self):
        ansBar = {
            'postURL': [], # post 주소
            'name': [], # 음식점 이름
            'region': [], # 음식점 위치 지역
            'foodtype': [], # 음식 종류
            'purpose': [], # 식당 소비 목적 (소개팅, 혼밥, 등)
            'rating': [], # 식당 평점
            'content': [], # 식당 리뷰 내용
            'location': [], # 식당 정확한 위치 (지도)
            'likeNum': [], # 좋아요 수
            'commentNum': [], # 댓글 수
            'imgUrls': [] # 이미지 file download 위치
        }
        if(self.now_row == 3): 
            self.now_row = 1
            self.now_line += 1
        else:
            self.now_row += 1
        print("Recorded posts: ", self.recorded)
        print("Post location: (cut: {0}, line: {1} row: {2}".format(self.cut, self.now_line, self.now_row))
        x = self.scroll_down_post()
        if(x == "Finish"):
            raise KeyboardInterrupt
        return ansBar

    def crawl_post(self, ansBar):
        # 게시글 열기
        try:
            k_post = self.listsoup.select("#react-root > section > main > div > div._2z6nI > article > div:nth-child(1) > div > div:nth-child("+str(self.now_line)+") > div:nth-child("+str(self.now_row)+") > a")
            k_post = k_post[0]
            k_post_href = k_post.get('href')
            print("href: ", k_post_href)
            if(len(self.excluded.loc[self.excluded['page'] == k_post_href]["page"]) >= 1):
                print("Excluded for request")
                return False
            if(k_post_href in self.looked):
                print("Already looked")
                return False
            if(self.isOnly == "URL" and k_post_href not in self.only):
                print("Not only-looking data")
                return False
            self.looked.append(k_post_href)
            try:
                self.driver.find_element_by_xpath('//a[@href="'+k_post_href+'"]').send_keys(Keys.ENTER)
                element = self.wait.until(EC.presence_of_element_located((By.XPATH, "//ul[@class='XQXOT']")))
                element = self.wait.until(EC.presence_of_element_located((By.XPATH, "//div[@class='_9AhH0']")))
            except Exception as E:
                print("Unable to reach post: ", E)
                self.error_page.append(k_post_href)
                self.error_reason.append(E)
                self.looked.remove(k_post_href)
                return False
            ansBar['postURL'] = k_post_href
        except KeyboardInterrupt:
            raise KeyboardInterrupt
        except Exception as E:            
            print("Error occured: ", E)
            print("Traceback: ", tc.getTracebackStr())
            self.error_page.append(k_post_href)
            self.error_reason.append(E)
            self.looked.remove(k_post_href)
            return False
        
        # 내부 component crawl
        error_after_open = False
        try:
            soup = BeautifulSoup(self.driver.page_source, 'html.parser')
            # name, content
            check = parsePost.get_Name_Content(soup, ansBar['name'], ansBar['content'])
            if(check == False):
                print("No Review data")
                raise Exception("No Review data")
            print("Is Review data")
            # region, foodtype 
            self.get_category(soup, ansBar['region'], ansBar['foodtype'])
            # likenum, commentnum
            parsePost.get_LikeNum(soup, ansBar['likeNum'])
            parsePost.get_CommentNum(soup, ansBar['commentNum'])
            # imgURLs
            self.get_ImgUrls(ansBar['imgUrls'])
        except KeyboardInterrupt:
            raise KeyboardInterrupt
        except Exception as E:
            print("Error occured during post page: ", E)
            print("Traceback: ", tc.getTracebackStr())
            self.error_page.append(k_post_href)
            self.error_reason.append(E)
            error_after_open = True
        
        # 게시물 닫기
        try:
            element = self.wait.until(EC.element_to_be_clickable((By.XPATH, "//button[@class='ckWGn']")))
            self.driver.find_element_by_xpath("//button[@class='ckWGn']").click()
            print("Page closed")
        except KeyboardInterrupt:
            raise KeyboardInterrupt
        except Exception as E:
            print("Error occured during closing page: ", E)
            print("Traceback: ", tc.getTracebackStr())
            return False
        
        if(error_after_open == True):
            return False
        return True

    def record_post(self, ansBar):
        try:
            post_dataframe = pd.DataFrame({
                'postURL': ansBar['postURL'],
                'name': ansBar['name'],
                'region': [ansBar['region']],
                'foodtype': [ansBar['foodtype']],
                # 'purpose': arr_purpose,
                # 'rating': arr_rating,
                'content': ansBar['content'],
                # 'location': arr_location,
                'likeNum': ansBar['likeNum'],
                'commentNum': ansBar['commentNum'],
                'imgUrls': ansBar['imgUrls'],
                'end': "endline"
                # '_id': []
            })
            if(self.recorded == 1):
                self.Reviews_dataframe = post_dataframe
            else:
                self.Reviews_dataframe = self.Reviews_dataframe.append(post_dataframe)
            self.recorded += 1
        except Exception as E:
            print("Error occured during writing on post", E)
            print("Post location: (cut: {0}, line: {1} row: {2}".format(self.cut, self.now_line, self.now_row))
    
    def start(self):
        """ # for bottom debug
        for i in range(0, 21):
            sleep(1)
            self.scroll_down_post(True)
        self.now_mlen = 0
        """
        try:
            while(self.recorded <= self.num):
                try:
                    ansBar = self.load_post()
                    if(False == self.crawl_post(ansBar)):
                        raise Exception("Post not opened due to error")
                    if(False == self.record_post(ansBar)):
                        raise Exception("Post not recorded due to error")
                except KeyboardInterrupt:
                    break
                except Exception as E:
                    print("Error in post open queue: ", E)
        finally:
            self.Reviews_dataframe.to_csv(os.path.join(self.ROOT_PATH, '..', 'result.csv'), encoding='utf-8-sig', index=False, sep="$")
            Crawled_dataframe = pd.DataFrame({'page': self.looked})
            Crawled_dataframe.to_csv(os.path.join(self.ROOT_PATH, '..', 'crawled.csv'), encoding='utf-8-sig', index=False, sep="$")
            Errored_dataframe = pd.DataFrame({'page': self.error_page, 'reason': self.error_reason})
            Errored_dataframe.to_csv(os.path.join(self.ROOT_PATH, '..', 'errored.csv'), encoding='utf-8-sig', index=False, sep="$")
            print("Recorded before ", self.recorded, "th item")
        
        # driver quit
        try:
            self.driver.close()
        except:
            pass
