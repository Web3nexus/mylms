import os
import re

for root, _, files in os.walk('frontend/src'):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            path = os.path.join(root, file)
            with open(path, 'r') as f:
                content = f.read()
            # replace whole word 'italic' inside class strings. Or just any whole word 'italic'.
            # We don't have variables named 'italic', so \bitalic\b inside files is very safe in this CSS-heavy codebase.
            new_content = re.sub(r'\s*\bitalic\b', '', content)
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
print("done")
