import streamlit as st
import google.generativeai as genai

# 1. SETTINGS PARA SA FULLSCREEN/WIDE VIEW
st.set_page_config(
    page_title="ACE AI PLANNER",
    layout="wide", # Kini ang mopa-wide sa screen
    initial_sidebar_state="collapsed"
)

# 2. SYSTEM INSTRUCTIONS (Gikan sa imong gihatag)
SYSTEM_INSTRUCTIONS = """
ROLE & INTERFACE LOGIC:
You are the "ACE AI PLANNER" engine.
Visual Output: You must generate the React + Tailwind CSS code to render an interactive dashboard.
Design Specifications:
- Sidebar: Dark background (#1A1A1A) with Orange (#FF6B00) accents.
- Main Window: White document container with black text.
- Orientation: Portrait for DLPs, Wide Landscape for DLLs (Mon-Fri).

SOURCE HIERARCHY:
- Use uploaded files (DLP/DLL templates) as structural templates.
- Internal Grounding: Prioritize curriculum modules.
- Web Search: Search DepEd-aligned content if missing.
- Reference Attribution: Include specific filenames or URLs.

FRAMEWORK LOGIC:
- 4A's (DLP/DLL): Activity, Analysis, Abstraction, Application.
- 7Es (DLL): Elicit, Engage, Explore, Explain, Elaborate, Evaluate, Extend.
- Pedagogy: English language, Differentiated Instruction (Visual, Auditory, Kinesthetic), Inclusion Strategies, and Reflection Table (A-F).
"""

# 3. PAG-SETUP SA API KEY (Gikan sa Streamlit Secrets)
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
except:
    st.error("Missing GEMINI_API_KEY. Palihog i-set kini sa Streamlit Cloud Secrets.")

# 4. UI DESIGN (Tailwind-like styling sa Streamlit)
st.markdown(f"""
    <style>
    .main {{ background-color: #f5f5f5; }}
    .stButton>button {{ background-color: #FF6B00; color: white; border-radius: 5px; }}
    </style>
    """, unsafe_allow_html=True)

st.title("🚀 ACE AI PLANNER")
st.write("Professional Lesson Planning Engine (DepEd Aligned)")

# User Inputs
with st.container():
    col1, col2 = st.columns([1, 1])
    with col1:
        subject = st.text_input("Subject / Topic", placeholder="e.g. Mathematics - Measures of Variability")
    with col2:
        framework = st.selectbox("Format/Framework", ["4A's DLP", "4A's DLL", "7Es DLL"])

    user_prompt = st.text_area("Specific Instructions or Learning Competency:", height=150)

if st.button("GENERATE LESSON PLAN"):
    if user_prompt:
        with st.spinner('Generating professional dashboard and plan...'):
            try:
                model = genai.GenerativeModel(
                    model_name='gemini-1.5-flash',
                    system_instruction=SYSTEM_INSTRUCTIONS
                )
                
                # Pag-combine sa subject ug framework sa prompt
                full_query = f"Create a {framework} about {subject}. Details: {user_prompt}"
                response = model.generate_content(full_query)
                
                # Output 1: Dashboard Code (React/Tailwind)
                st.subheader("🖥️ Interactive Dashboard Preview (Code)")
                st.code(response.text, language='jsx')
                
                # Output 2: Markdown version para sa MS Word
                st.subheader("📄 Markdown Version (Copy to Word)")
                st.markdown(response.text)
                
            except Exception as e:
                st.error(f"Error: {e}")
    else:
        st.warning("Palihog butangi og topic o instructions.")
