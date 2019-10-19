from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

import requests
from bs4 import BeautifulSoup
from time import sleep

import os
ROOT_PATH = os.path.abspath(os.path.dirname(__file__))
DRIVER_PATH = os.path.join(ROOT_PATH, 'webdriver', 'chromedriver_mac')
driver = webdriver.Chrome(executable_path=DRIVER_PATH)

driver.get('https://map.naver.com/')
sleep(1)

wait = WebDriverWait(driver, 30)

location = input('input location : ')

driver.find_element_by_xpath('//*[@id="search-input"]').send_keys(location)
driver.find_element_by_xpath('//*[@id="header"]/div[1]/fieldset/button').click()
sleep(1)

soup = BeautifulSoup(driver.page_source, 'html.parser')

driver.find_element_by_xpath('//*[@id="naver_map"]/div[2]/div[2]/div[5]/a[2]').click()
sleep(0.3)
driver.find_element_by_xpath('//*[@id="simplemodal-data"]/div[2]/a[1]').click()
sleep(0.3)

driver.find_element_by_xpath('//*[@id="naver_map"]/div[2]/div[2]/div[5]/a[3]').click()
sleep(0.3)

soup = BeautifulSoup(driver.page_source, 'html.parser')
sleep(0.3)

location_url = soup.find('a', 'ii_url _urlText').text
print(location_url)