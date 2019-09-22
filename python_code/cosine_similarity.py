import re, math
from collections import Counter


WORD = re.compile(r'\w+')


def get_cosine(vec1, vec2):
    intersection = set(vec1.keys()) & set(vec2.keys())
    numerator = sum([vec1[x] * vec2[x] for x in intersection])

    sum1 = sum([vec1[x] ** 2 for x in vec1.keys()])
    sum2 = sum([vec2[x] ** 2 for x in vec2.keys()])
    denominator = math.sqrt(sum1) * math.sqrt(sum2)

    if not denominator:
        return 0.0
    else:
        return float(numerator) / denominator


def text_to_vector(text):
    words = WORD.findall(text)
    return Counter(words)


def givKeywordsValue(text1, text2,out_of):
    vector1 = text_to_vector(text1)
    vector2 = text_to_vector(text2)
    #int(out_of,2)
    cosine = round(get_cosine(vector1, vector2),2)*100
    kval = 0
    if cosine > 80:
        kval = (out_of*1)
    elif cosine > 600:
        kval = (out_of*0.8)
    elif cosine > 400:
        kval = (out_of*0.5)
    elif cosine > 20:
        kval = (out_of*0.2)
    else:
        kval = (out_of*0.1)
    return kval


