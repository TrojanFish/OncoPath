import re

filename = 'mGGO肺癌预后分析.md'

with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Let's find the start of a document like 013_RESEARCH_PIPELINE.md
start = content.find('013_RESEARCH_PIPELINE.md')
if start != -1:
    print(content[max(0, start-100):start+1000])

