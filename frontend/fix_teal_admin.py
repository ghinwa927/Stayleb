import pathlib, re

# Fix PropertyApprovals white on light backgrounds to teal
files = [
    r"C:\Users\ASUS VivoBook\StayLeb\frontend\src\components\features\admin\PropertyApprovalsSection0.tsx",
    r"C:\Users\ASUS VivoBook\StayLeb\frontend\src\components\features\admin\UsersManagementSection0.tsx",
    r"C:\Users\ASUS VivoBook\StayLeb\frontend\src\components\features\admin\AmenitiesManagementSection0.tsx",
    r"C:\Users\ASUS VivoBook\StayLeb\frontend\src\components\features\admin\RulesManagementSection0.tsx",
]

for fp in files:
    p = pathlib.Path(fp)
    t = p.read_text(encoding="utf-8")
    orig = t
    # Fix specific patterns where white text is on light bg
    # For PropertyApprovals:
    # 1. bg-surface-container-lowest/20 with text-white -> should be text-primary or text-[#157375]
    t = t.replace('bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-white', 'bg-surface-container-lowest/20 backdrop-blur-md flex items-center justify-center text-[#157375]')
    t = t.replace('bg-surface-container-lowest/25 text-white', 'bg-surface-container-lowest/25 text-[#157375]')
    # Input with bg-surface-container-lowest and text-white -> should be text-[#157375] or text-on-surface
    t = t.replace('bg-surface-container-lowest text-white placeholder:text-white', 'bg-surface-container-lowest text-[#157375] placeholder:text-[#157375]/60')
    # Button with bg-surface-container and text-white -> should be teal text
    t = t.replace('bg-surface-container hover:bg-surface-container-high text-white font-label-md', 'bg-surface-container hover:bg-surface-container-high text-[#157375] font-label-md')
    # For UsersManagement top cards: bg-surface-container with text-white (icons)
    t = t.replace('bg-surface-container flex items-center justify-center text-white">', 'bg-surface-container flex items-center justify-center text-[#157375]">')
    # Also for any remaining bg-surface-container text-white
    t = re.sub(r'bg-surface-container([^\"]*) text-white(?=["\s])', r'bg-surface-container\1 text-[#157375]', t)
    
    if t != orig:
        p.write_text(t, encoding="utf-8")
        print(f"fixed {p.name}")
    else:
        print(f"no change {p.name}")

print("done")
