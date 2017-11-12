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

means = {}

for cat in categories:
    #print(len(get_links(cat)), 'stories on', cat)
    links = get_links(cat)
    genre = cat.split('http://www.bbc.co.uk/news/',1)[1]
    total = 0
    for link in links:
        url = 'http://www.bbc.co.uk' + link
        article = nlp.article_stats(url)
        total += article['CVC'] #ContentVeracityCoefficient
        print('Running average CVC for',genre,':',"{0:.4g}".format(article['CVC'])+'%',article['Betteridge_legal'])

    means[genre] = total/len(links)

#{'science_and_environment': 42.54510740364179, 'technology': 42.004529639888055, 'world': 37.90266397046892, 'politics': 36.99325544181844, 'business': 41.40400187855529, 'uk': 35.701223182676536, 'health': 42.31750801019711}
#{'uk': 77.46166622956329, 'science_and_environment': 76.53854188139204, 'technology': 67.58745931370972, 'world': 72.42309434272542, 'politics': 74.64069128805663, 'health': 66.83949355258562, 'business': 66.7497439954376}
