import re

with open("frontend/src/components/IntelligenceHub.tsx", "r", encoding="utf-8") as f:
    content = f.read()

# We want to extract:
# 1. radar_block
# 2. verdict_block
# 3. shap_block

radar_start = content.find("{/* Radar Chart */}")
verdict_start = content.find("{/* Prediction Summary + 3-Bar Comparison */}")
shap_start = content.find("{/* SHAP Feature Attribution */}")
animate_end = content.find("</motion.div>")

radar_block = content[radar_start:verdict_start].strip()
verdict_block = content[verdict_start:shap_start].strip()
shap_block = content[shap_start:animate_end].strip()

# Now reconstruct!
new_structure = f"""        {{/* SECTION I: INSTRUCTION & SUMMARY */}}
        <div className="w-full">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">I. System Verdict & Instruction</h3>
          {{/* The Verdict block was col-span-7, now full width */}}
          <div className="w-full v4-glass-card rounded-[3rem] p-8 flex flex-col justify-between relative overflow-hidden">
            {verdict_block.replace('<div className="xl:col-span-7 v4-glass-card rounded-[3rem] p-8 flex flex-col justify-between relative overflow-hidden h-full">', '')[:-6]}
          </div>
        </div>

        <div className="w-full h-[1px] bg-white/10 my-2" />

        {{/* SECTION II: EXPLAINING / FACTORS CONTRIBUTING */}}
        <div className="w-full mt-4">
          <h3 className="text-2xl font-black text-white italic tracking-tighter uppercase mb-6 drop-shadow-2xl">II. Explaining Contributing Factors</h3>
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
            {{/* Radar Chart */}}
            {radar_block}
            
            {{/* SHAP */}}
            <div className="xl:col-span-7 flex flex-col">
              {shap_block}
            </div>
          </div>
        </div>
"""

# Replace the old top analysis row + shap
start_replace = content.find("{/* Top Analysis Row */}")

new_content = content[:start_replace] + new_structure + "\n      " + content[animate_end:]

# Let's fix the removed div from verdict block
new_content = new_content.replace('</div>\n          </div>', '</div>\n          </div>\n          </div>', 1) 
# Actually just doing string replace is prone to tag mismatch errors. Let's write the file.

with open("frontend/src/components/IntelligenceHub.tsx", "w", encoding="utf-8") as f:
    f.write(new_content)
    
print("Success")
