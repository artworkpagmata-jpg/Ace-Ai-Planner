import streamlit as st
import google.generativeai as genai

# 1. PAGE CONFIG
st.set_page_config(page_title="ACE AI PLANNER", layout="wide", initial_sidebar_state="collapsed")

# 2. ULTIMATE CSS (Landing + Dashboard Styling)
st.markdown("""
    <style>
    #MainMenu, footer, header {visibility: hidden;}
    .stApp { background-color: #050505; color: white; }
    
    /* --- LANDING PAGE CSS --- */
    .landing-container {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80vh;
        text-align: center;
    }
    .main-logo {
        background: #ff4400;
        padding: 15px;
        border-radius: 12px;
        margin-bottom: 20px;
        display: inline-block;
    }
    .landing-title { font-size: 42px; font-weight: 900; letter-spacing: -1px; margin: 0; }
    .landing-subtitle { color: #888; font-size: 14px; margin-top: 5px; font-weight: 500; }
    .landing-author { color: #ff4400; font-size: 10px; font-weight: 800; letter-spacing: 2px; margin-top: 10px; }

    /* --- DASHBOARD CSS --- */
    .glass-card {
        background: #0d0d0d;
        border: 1px solid #1a1a1a;
        border-radius: 30px;
        padding: 30px;
        margin-bottom: 20px;
    }
    .orange-label {
        color: #ff4400;
        font-size: 10px;
        font-weight: 800;
        text-transform: uppercase;
        margin-bottom: 10px;
        letter-spacing: 1px;
    }
    .upload-zone {
        border: 1.5px dashed #222;
        border-radius: 20px;
        padding: 50px 20px;
        text-align: center;
        background: #080808;
    }

    /* CUSTOM STREAMLIT INPUTS */
    div[data-baseweb="input"], div[data-baseweb="select"], div[data-baseweb="textarea"] {
        background-color: #000000 !important;
        border: 1px solid #222 !important;
        border-radius: 12px !important;
    }
    
    /* THE BUTTONS */
    .stButton > button {
        background: #ff4400 !important;
        color: white !important;
        border: none !important;
        border-radius: 15px !important;
        font-weight: 900 !important;
        text-transform: uppercase;
        letter-spacing: 1px;
        transition: 0.3s;
    }
    .stButton > button:hover { transform: scale(1.02); background: #ff5511 !important; }
    
    /* PORTRAIT CONTAINER */
    .portrait-box {
        background: #000;
        border: 1px solid #111;
        border-radius: 15px;
        padding: 20px;
        min-height: 100px;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. API SETUP
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
except:
    st.error("API Key missing in Streamlit Secrets.")

# 4. NAVIGATION LOGIC
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

# --- VIEW 1: LANDING PAGE (image_917dbe.png) ---
if st.session_state.page == 'landing':
    st.markdown('<div class="landing-container">', unsafe_allow_html=True)
    st.markdown("""
        <div class="main-logo">
            <img src="https://cdn-icons-png.flaticon.com/512/1162/1162456.png" width="40" style="filter: invert(1);">
        </div>
        <p class="landing-title">ACE AI <span style="color:#ff4400">PLANNER</span></p>
        <p class="landing-subtitle">DepEd Professional Instructional Design</p>
        <p class="landing-author">BY: JAY-ART T. SADJAIL</p>
        <br>
    """, unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1.5, 1])
    with col2:
        if st.button("ENTER WORKSPACE", use_container_width=True):
            st.session_state.page = 'workspace'
            st.rerun()
    st.markdown('</div>', unsafe_allow_html=True)

# --- VIEW 2: WORKSPACE (image_917d21.png) ---
else:
    # Top Header
    h_col1, h_col2 = st.columns([0.8, 0.2])
    with h_col1:
        st.markdown("""
            <div style="display: flex; align-items: center; gap: 15px;">
                <div style="background: #ff4400; padding: 6px; border-radius: 8px;">
                    <img src="https://cdn-icons-png.flaticon.com/512/1162/1162456.png" width="20" style="filter: invert(1);">
                </div>
                <div>
                    <p style="font-size: 18px; font-weight: 900; margin:0;">ACE AI <span style="color:#ff4400">PLANNER</span></p>
                    <p style="font-size: 9px; color: #555; margin:0; font-weight:bold;">DEVELOPED BY: JAY-ART T. SADJAIL</p>
                </div>
            </div>
        """, unsafe_allow_html=True)
    with h_col2:
        if st.button("EXIT"):
            st.session_state.page = 'landing'
            st.rerun()

    st.markdown("<br>", unsafe_allow_html=True)

    # Main Grid
    col_main, col_ref = st.columns([0.65, 0.35], gap="medium")

    with col_main:
        st.markdown('<div class="glass-card">', unsafe_allow_html=True)
        st.markdown('<p style="text-align:right; font-size:10px; color:#333; font-weight:bold;">RESET FORM</p>', unsafe_allow_html=True)
        
        r1_a, r1_b = st.columns(2)
        with r1_a:
            st.markdown('<p class="orange-label">School</p>', unsafe_allow_html=True)
            school = st.text_input("sch", value="Araibo National High School", label_visibility="collapsed")
        with r1_b:
            st.markdown('<p class="orange-label">Instructor</p>', unsafe_allow_html=True)
            instr = st.text_input("ins", value="Jay-Art T. Sadjail", label_visibility="collapsed")
        
        r2_a, r2_b = st.columns(2)
        with r2_a:
            st.markdown('<p class="orange-label">Grade Level</p>', unsafe_allow_html=True)
            grade = st.selectbox("grd", ["Grade 7", "Grade 8", "Grade 9", "Grade 10"], label_visibility="collapsed")
        with r2_b:
            st.markdown('<p class="orange-label">Learning Area</p>', unsafe_allow_html=True)
            area = st.text_input("are", value="Mathematics", label_visibility="collapsed")
        
        st.markdown("<br>", unsafe_allow_html=True)
        f_col = st.columns([0.3, 0.2, 0.5])
        with f_col[0]: st.markdown('<p class="orange-label" style="margin-top:10px;">📋 Selected Framework</p>', unsafe_allow_html=True)
        with f_col[1]: st.selectbox("d", ["1", "2", "3"], label_visibility="collapsed")
        with f_col[2]: st.selectbox("f", ["Daily Lesson Plan (4A's Strategy)", "7Es DLL", "4A's DLL"], label_visibility="collapsed")

        st.markdown("<hr style='border:0.1px solid #111; margin:20px 0;'>", unsafe_allow_html=True)
        st.markdown('<p style="text-align:center; color:#222; font-size:9px; font-weight:bold; letter-spacing:2px;">DAILY LESSON PLAN BREAKDOWN</p>', unsafe_allow_html=True)
        
        st.markdown('<p class="orange-label">Plan #1 Topic</p>', unsafe_allow_html=True)
        topic = st.text_area("top", placeholder="Topic for day 1...", height=100, label_visibility="collapsed")
        st.markdown('</div>', unsafe_allow_html=True)

    with col_ref:
        st.markdown('<div class="glass-card" style="height:100%;">', unsafe_allow_html=True)
        st.markdown('<p class="orange-label">Reference Support</p>', unsafe_allow_html=True)
        st.markdown('<div class="upload-zone">', unsafe_allow_html=True)
        st.file_uploader("UP", type=['pdf'], label_visibility="collapsed")
        st.markdown('<p style="font-size:10px; color:#444; margin-top:10px;">ATTACH MATERIAL</p>', unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown("<br><br><br><p style='text-align:center; color:#222; font-size:10px;'>NO FILES ATTACHED.</p>", unsafe_allow_html=True)
        
        if st.button("GENERATE PLAN", use_container_width=True):
            if topic:
                with st.spinner("ACE ENGINE PROCESSING..."):
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    res = model.generate_content(f"Generate {grade} {area} plan for {topic}")
                    st.session_state.result = res.text
        st.markdown('</div>', unsafe_allow_html=True)

    # Output
    if 'result' in st.session_state:
        st.markdown("---")
        st.write(st.session_state.result)
    
    st.markdown("<p style='text-align:center; color:#1a1a1a; font-size:10px; letter-spacing:5px; margin-top:50px;'>ACE AI PLANNER ENGINE</p>", unsafe_allow_html=True)
