import re
import os
import sys
import io

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

filename = 'mGGO肺癌预后分析.md'
output_dir = 'docs'

with open(filename, 'r', encoding='utf-8') as f:
    content = f.read()

# Pattern for markdown code blocks containing the file path
# Matches:
# `markdown (or just `)
# docs/013_RESEARCH_PIPELINE.md
# (content)
# `
# OR
# docs/013_RESEARCH_PIPELINE.md
# `markdown
# (content)
# `
# Let's extract everything based on the docs/XXX.md headers.
# A robust way is to split the content by "docs/0" and then parse each section.

parts = content.split("docs/0")
extracted = 0

for i in range(1, len(parts)):
    part = parts[i]
    # The part starts with e.g. "13_RESEARCH_PIPELINE.md"
    match = re.match(r'^([0-9]{2}_[A-Z0-9_]+\.md)', part)
    if not match:
        continue
    
    filename = "0" + match.group(1)
    
    # Where does this file end? It usually ends when a new file starts, or at the end of a code block.
    # We can extract from the filename down to the next ` or the next "docs/"
    body = part[len(match.group(1)):]
    
    # If body starts with a newline, strip it
    body = body.lstrip()
    
    # If the filename was inside a ` markdown block, the body might end with `
    # Let's find the first ` that appears at the start of a line, or just take the rest until next heading
    if body.startswith("`"):
        # e.g. docs/013.md\n`markdown\n...
        body = body.split("\n", 1)[1] if "\n" in body else body
        end_idx = body.find("\n`")
        if end_idx != -1:
            body = body[:end_idx]
    else:
        # e.g. `markdown\ndocs/013.md\n...
        end_idx = body.find("\n`")
        if end_idx != -1:
            body = body[:end_idx]
        else:
            # If no ` is found, it might just be raw markdown
            # Find the next "# docs/" or similar
            end_idx2 = body.find("\ndocs/")
            if end_idx2 != -1:
                body = body[:end_idx2]
                
    # Remove leading/trailing newlines
    body = body.strip()
    
    if len(body) > 10:
        filepath = os.path.join(output_dir, filename)
        if not os.path.exists(filepath):
            with open(filepath, 'w', encoding='utf-8') as out_f:
                out_f.write(body)
            print(f"Created {filename}")
            extracted += 1
            
print(f"Total extracted: {extracted}")
