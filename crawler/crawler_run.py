import insta_crawler
import sys

if(__name__ == "__main__"):
    instance = insta_crawler.app.SnuffCrawl(int(sys.argv[1]), sys.argv[2:])
    instance.start()
