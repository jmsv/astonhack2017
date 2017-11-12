import nlp
import requests
import bs4


categories = ['http://www.bbc.co.uk/news/uk',
              'http://www.bbc.co.uk/news/world',
              'http://www.bbc.co.uk/news/business',
              'http://www.bbc.co.uk/news/politics',
              'http://www.bbc.co.uk/news/technology',
              'http://www.bbc.co.uk/news/science_and_environment',
              'http://www.bbc.co.uk/news/health']

def get_links( category ):
    articles = requests.get(category)
    articles.raise_for_status()
    soup = bs4.BeautifulSoup(articles.text, 'lxml')
    column = soup.find("div",{"class":"column--primary"})
    links = column.findAll("a", href=True)

    links = [a['href'] for a in links]

    links = list(set(links))

    links = [link for link in links if link[0] == '/' and link[-1].isdigit()]
    return links


for cat in categories:
    #print(len(get_links(cat)), 'stories on', cat)
    links = get_links(cat)
    genre = cat.split('http://www.bbc.co.uk/news/',1)[1]
    total = 0
    tally = 0
    for link in links:
        url = 'http://www.bbc.co.uk' + link
        total += nlp.article_stats(url)['Subjectivity']
        tally += 1
        print('Running average subjectivity for',genre,':',"{0:.4g}".format(total/tally)+'%')

