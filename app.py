import streamlit as st
import google.generativeai as genai

# 1. PAGE SETUP (ALWAYS WIDE)
st.set_page_config(page_title="ACE AI PLANNER", layout="wide", initial_sidebar_state="collapsed")

# 2. CUSTOM CSS PARA MA-COPY ANG DESIGN SA SCREENSHOT
st.markdown("""
    <style>
    .stApp { background-color: #050505; color: white; }
    
    /* Input Container Style */
    div[data-testid="stVerticalBlock"] > div:has(div.stTextInput) {
        background-color: #111111;
        padding: 20px;
        border-radius: 15px;
        border: 1px solid #222;
    }

    /* Orange Label Style */
    .field-label {
        color: #FF6B00;
        font-size: 11px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
        letter-spacing: 1px;
    }

    /* Customizing Input Boxes */
    input, textarea, div[data-baseweb="select"] {
        background-color: #000000 !important;
        color: white !important;
        border: 1px solid #333 !important;
    }

    /* Reference Support Box (Dashed) */
    .ref-box {
        border: 2px dashed #333;
        border-radius: 15px;
        padding: 40px;
        text-align: center;
        background-color: #0A0A0A;
    }

    /* Generate Button (Solid Orange) */
    div.stButton > button {
        background-color: #FF6B00 !important;
        color: white !important;
        border-radius: 12px !important;
        height: 60px !important;
        font-size: 18px !important;
        font-weight: bold !important;
        width: 100% !important;
        border: none !important;
        text-transform: uppercase;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. API & SYSTEM INSTRUCTIONS
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
except:
    st.error("Missing API Key in Streamlit Secrets.")

# Kini ang imong personalized rules gikan sa AI Studio
SYSTEM_RULES = """
ROLE & INTERFACE LOGIC:
You are the "ACE AI PLANNER" engine.
Visual Output: You must generate the React + Tailwind CSS code to render an interactive dashboard.
Follow the sequence: Activity, Analysis, Abstraction, and Application.
Always include the Teacher's Reflection section (A-F).
"""

# 4. DASHBOARD LAYOUT (image_911be5.png style)
st.markdown("### <img src='https://cdn-icons-png.flaticon.com/512/3063/3063200.png' width='30'> ACE AI **PLANNER**", unsafe_allow_html=True)
st.markdown("<p style='font-size:10px; color:#555;'>DEVELOPED BY: JAY-ART T. SADJAIL</p>", unsafe_allow_html=True)

# Main Grid: Form (Left) | Reference (Right)
col_left, col_right = st.columns([0.65, 0.35], gap="large")

with col_left:
    # Row 1: School & Instructor
    r1_a, r1_b = st.columns(2)
    with r1_a:
        st.markdown('<p class="field-label">School</p>', unsafe_allow_html=True)
        school = st.text_input("school", value="Araibo National High School", label_visibility="collapsed")
    with r1_b:
        st.markdown('<p class="field-label">Instructor</p>', unsafe_allow_html=True)
        instructor = st.text_input("instr", value="Jay-Art T. Sadjail", label_visibility="collapsed")

    # Row 2: Grade & Learning Area
    r2_a, r2_b = st.columns(2)
    with r2_a:
        st.markdown('<p class="field-label">Grade Level</p>', unsafe_allow_html=True)
        grade = st.selectbox("grade", ["Grade 7", "Grade 8", "Grade 9", "Grade 10"], label_visibility="collapsed")
    with r2_b:
        st.markdown('<p class="field-label">Learning Area</p>', unsafe_allow_html=True)
        area = st.text_input("area", value="Mathematics", label_visibility="collapsed")

    # Row 3: Framework selection
    st.markdown('<p class="field-label">Selected Framework</p>', unsafe_allow_html=True)
    framework = st.selectbox("frame", ["Daily Lesson Plan (4A's Strategy)", "7Es DLL", "4A's DLL"], label_visibility="collapsed")

    # Row 4: Topic
    st.markdown('<p class="field-label">Plan #1 Topic</p>', unsafe_allow_html=True)
    topic = st.text_area("topic", placeholder="Topic for day 1...", height=80, label_visibility="collapsed")

with col_right:
    st.markdown('<p class="field-label">Reference Support</p>', unsafe_allow_html=True)
    with st.container():
        st.markdown('<div class="ref-box">', unsafe_allow_html=True)
        uploaded_file = st.file_uploader("ATTACH MATERIAL", type=['pdf', 'docx', 'txt'], label_visibility="visible")
        st.markdown('</div>', unsafe_allow_html=True)
    
    st.markdown("<br><br>", unsafe_allow_html=True)
    if st.button("GENERATE PLAN"):
        if topic:
            with st.spinner("Processing..."):
                model = genai.GenerativeModel(model_name='gemini-1.5-flash', system_instruction=SYSTEM_RULES)
                response = model.generate_content(f"Create {framework} for {area}, Topic: {topic}")
                st.session_state.output = response.text

# 5. OUTPUT SECTION
if 'output' in st.session_state:
    st.markdown("---")
    st.markdown('<p class="field-label">Generated Lesson Plan</p>', unsafe_allow_html=True)
    st.write(st.session_state.output)
