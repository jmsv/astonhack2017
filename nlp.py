#Presentation - not biased to arbratrarily ascribe truth to one outlet or the other.
#URLlist.
#Fake news will have lower word counts? (shorter words)
#Fewer sources, regex to detect source
#More words that are not in dictionary
#Grammar
#More sentiment (emotive language)
#Recent articles have smaller maximums.
#BERTRIDGES LAW If headline is a question it's fake news.

#Using re now too, and another nlp library
##$ pip install -U textblob
##$ python -m textblob.download_corpora

import requests
import urllib
import nltk
import operator
import sys
import re
from textblob import TextBlob
from bs4 import BeautifulSoup

def get_article(url):
    """
    Takes URL argument, returns the article body by picking longest visible text blocks.
    Probably a better way.
    """
    
    html = urllib.request.urlopen(url).read()
    soup = BeautifulSoup(html, 'lxml')

    #SCRUB script and style elements
    for script in soup(["script", "style"]):
        script.extract()
        
    # get text
    text = soup.get_text()

    # break into lines and remove leading and trailing space on each
    lines = (line.strip() for line in text.splitlines())
    # break multi-headlines into a line each
    chunks = (phrase.strip() for line in lines for phrase in line.split("  "))
    # drop blank lines
    text = '\n'.join(chunk for chunk in chunks if chunk)

    #Make list of all elements featuring visible plain text
    cuttings = text.split('\n')
    #Sort them by length (longer more likely to be body of article

    '''
    Technique picking 10 largest chunks of plaintext and considering that the article

    cuts = 10 #Amout of elements that will form an article
    main_cuts = []

    if len(cuttings)>10:
        #Will jumble the order reducing legability
        sorted_cuttings = sorted(cuttings, key = len, reverse = True)
        cut_crop = len(sorted_cuttings[10])
        main_cuts.extend([cut for cut in cuttings if len(cut) > cut_crop])
    else:
        main_cuts = cuttings
    #cuttings = sorted(cuttings, key = len, reverse = True)
    '''

    #Alternative technique, can assume such terse elements are links 'Like us on facebook, other stories etc'
    main_cuts = [cut for cut in cuttings if len(cut) > 100]

    article = '\n'.join(main_cuts)
    return article



BBC_chatbot_love = "http://www.bbc.co.uk/news/technology-41885427"
BBC_Armistice_Day = "http://www.bbc.co.uk/news/uk-41952990"

punctuation = list('!"#$%&\'()*+,-./:;<=>?@[\\]^_`{|}~')
punctuation.extend(['\'\'','``'])


#article = '\n'.join(get_main_cuts(BBC_chatbot_love)) needed if get_article returned main_cuts
def get_grammar_census(url):
    '''
    Uses get article, returns a dictionary/ of word-type and frequency.
    Updated to return percentage of basic word types. Not even sure why tbqfh.
    '''
    article_tokens = nltk.word_tokenize(get_article(url))
    article_tagged = nltk.pos_tag(article_tokens) #parts of speech
    grammar = {}
    for word in article_tagged:
        if word[1] not in punctuation:
            if word[1] not in grammar:
                grammar[word[1]] = 1
            else:
                grammar[word[1]] += 1

    basic_grammar = {'Noun':0,'Verb':0,'Adjective':0,'Adverb':0,'Other':0}
    for word_type in grammar:
        if word_type[0] == 'N':
            basic_grammar['Noun'] += grammar[word_type]
        elif word_type[0] == 'V':
            basic_grammar['Verb'] += grammar[word_type]
        elif word_type[0] == 'J':
            basic_grammar['Adjective'] += grammar[word_type]
        elif word_type[0] == 'R':
            basic_grammar['Adverb'] += grammar[word_type]
        else:
            basic_grammar['Other'] += grammar[word_type]

    grammar_total = sum(basic_grammar.values())
    #Turn primitive grammar into percentages.
    for word_type in basic_grammar:
        basic_grammar[word_type] *= (100/grammar_total)
    

    return basic_grammar

def remove_quotes(article):
    #Seems fair to remove quotes from an article before measureing for polarity or subjectivty.
    #Reporting on polarizing language might make their reporting seem polarizing otherwise.
    single_quotes = r'\[.*?\]'
    double_quotes = r'\(.*?\)'
    article = re.sub(single_quotes,'',article)
    article = re.sub(double_quotes,'',article)
    return article
    
def get_polarity(article):
    #Returns score between 0 and 100, information is lost in that it doesn't express in which direction the text is polarised.
    article_blob = TextBlob(article)
    polarity = abs(article_blob.sentiment.polarity)*100
    return polarity

def get_subjectivity(article):
    article_blob = TextBlob(article)
    subjectivity = abs(article_blob.sentiment.subjectivity)*100
    return subjectivity

def Betteridge_legal(url):
    article = requests.get(url)
    article.raise_for_status()
    soup = BeautifulSoup(article.text, 'lxml')
    header = soup.find('h1')
    if header.text[-1] == '?':
        return False
    return True

def article_stats(url):
    article_stats = {}
    article = get_article(url)
    gram_dict = get_grammar_census(url)
    gd_sorted = sorted(gram_dict.items(), key = operator.itemgetter(1), reverse = True)
    article_stats['Grammar'] = gd_sorted
    article_no_quotes = remove_quotes(article)
    article_stats['Polarity'] = get_polarity(article_no_quotes)
    article_stats['Subjectivity'] = get_subjectivity(article_no_quotes)
    article_stats['Betteridge_legal'] = Betteridge_legal(url)
    
    ContentVeracityCoefficient = 100 - (article_stats['Subjectivity']/2) - (article_stats['Polarity']/4)
    if not article_stats['Betteridge_legal']:
        ContentVeracityCoefficient /= 4

    article_stats['CVC'] = ContentVeracityCoefficient 
    return article_stats

if __name__ == '__main__':
    print(article_stats(str(sys.argv[1])))


            




