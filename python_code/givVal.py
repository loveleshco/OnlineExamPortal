import math
import re
import sys
#import language_check
import cosine_similarity as keywordVal
from grammarbot import GrammarBotClient

client = GrammarBotClient(api_key='AF5B9M2X')
#pip install grammarbot


def givVal():
    # KEYWORDS =>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
    # TODO : Enhacnce this thing
    model_answer=sys.argv[1]
    #tool = language_check.LanguageTool('en-US')
    keywords=sys.argv[2]
    #print ("Write answers specific")
    #answer=input()
    #print(sys.argv[1:])
    answer=sys.argv[3]
    #matches = tool.check(text)
    out_of=int(sys.argv[4])
    '''
    if (len(answer.split())) <= 3:
        return 0
   '''
    k = keywordVal.givKeywordsValue(model_answer, answer,out_of)
    res = client.check(answer)

    #print(len(res.matches))
    if len(res.matches) > 5 :
        g = -0.5
    else:
        g = 0
    
    count = 0
    keywords_count = len(keywords)
    for i in range(keywords_count):
        if keywords[i] in answer:
           #print (keywords[i])
           count = count + 1
        key = 0
        if count == keywords_count:
           key = 1
        elif count == (keywords_count - 1):
           key = 0.9
        elif count == (keywords_count - 2):
           key = 0.8
        elif count == (keywords_count - 3):
           key = 0.7
        elif count == (keywords_count - 4):
           key = 0.6
        else:
           key = 0.5
     

    #print(key)
    print((k+g)*key)
givVal()