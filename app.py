import streamlit as st
import google.generativeai as genai

# 1. PAGE CONFIG & THEME
st.set_page_config(page_title="ACE AI PLANNER", layout="wide", initial_sidebar_state="collapsed")

# 2. CUSTOM CSS PARA SA PRO DASHBOARD (BLACK & ORANGE)
st.markdown("""
    <style>
    .stApp { background-color: #050505; color: white; }
    [data-testid="stHeader"] { background: rgba(0,0,0,0); }
    
    /* Container Style */
    .main-card {
        background-color: #111111;
        border-radius: 20px;
        padding: 30px;
        border: 1px solid #222;
    }
    
    /* Input Labels */
    .input-label {
        color: #FF6B00;
        font-size: 12px;
        font-weight: bold;
        text-transform: uppercase;
        margin-bottom: 5px;
    }

    /* Override Streamlit Input Style */
    div[data-baseweb="input"], div[data-baseweb="select"], div[data-baseweb="textarea"] {
        background-color: #1A1A1A !important;
        border: 1px solid #333 !important;
        border-radius: 10px !important;
    }
    
    /* Generate Button */
    div.stButton > button {
        background: linear-gradient(90deg, #FF6B00 0%, #FF8533 100%) !important;
        color: white !important;
        border: none !important;
        padding: 20px !important;
        border-radius: 15px !important;
        font-weight: bold !important;
        font-size: 18px !important;
        letter-spacing: 1px;
    }
    </style>
    """, unsafe_allow_html=True)

# 3. API SETUP
try:
    genai.configure(api_key=st.secrets["GEMINI_API_KEY"])
except:
    st.error("Missing API Key in Secrets.")

# 4. APP LOGIC
if 'page' not in st.session_state:
    st.session_state.page = 'landing'

# --- LANDING PAGE ---
if st.session_state.page == 'landing':
    st.markdown("<br><br><br>", unsafe_allow_html=True)
    col1, col2, col3 = st.columns([1,2,1])
    with col2:
        st.image("https://cdn-icons-png.flaticon.com/512/3063/3063200.png", width=100) # Temporary Icon
        st.markdown("<h1 style='text-align: center; color: white;'>ACE AI <span style='color:#FF6B00'>PLANNER</span></h1>", unsafe_allow_html=True)
        st.markdown("<p style='text-align: center; color: #888;'>DepEd Professional Instructional Design<br>BY: JAY-ART T. SADJAIL</p>", unsafe_allow_html=True)
        if st.button("ENTER WORKSPACE"):
            st.session_state.page = 'workspace'
            st.rerun()

# --- MAIN DASHBOARD (WORKSPACE) ---
else:
    # Header
    cols = st.columns([0.1, 0.9, 0.1])
    with cols[0]: st.image("https://cdn-icons-png.flaticon.com/512/3063/3063200.png", width=50)
    with cols[1]: st.markdown("### ACE AI <span style='color:#FF6B00'>PLANNER</span>", unsafe_allow_html=True)
    with cols[2]: 
        if st.button("EXIT"):
            st.session_state.page = 'landing'
            st.rerun()

    st.markdown("---")

    # Layout: Form left, Reference right
    col_main, col_ref = st.columns([0.65, 0.35])

    with col_main:
        st.markdown('<p class="input-label">School Details</p>', unsafe_allow_html=True)
        school = st.text_input("School Name", value="Araibo National High School", label_visibility="collapsed")
        
        c1, c2 = st.columns(2)
        with c1:
            st.markdown('<p class="input-label">Instructor</p>', unsafe_allow_html=True)
            instructor = st.text_input("Name", value="Jay-Art T. Sadjail", label_visibility="collapsed")
        with c2:
            st.markdown('<p class="input-label">Grade Level</p>', unsafe_allow_html=True)
            grade = st.selectbox("Level", ["Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"], label_visibility="collapsed")

        st.markdown('<p class="input-label">Learning Area</p>', unsafe_allow_html=True)
        subject = st.text_input("Subject Topic", placeholder="e.g. Mathematics", label_visibility="collapsed")

        st.markdown('<p class="input-label">Selected Framework</p>', unsafe_allow_html=True)
        framework = st.selectbox("Framework", ["Daily Lesson Plan (4A's Strategy)", "7Es DLL", "4A's DLL"], label_visibility="collapsed")
        
        st.markdown('<p class="input-label">Topic / Instructions</p>', unsafe_allow_html=True)
        topic_desc = st.text_area("Details", placeholder="Topic for day 1...", height=100, label_visibility="collapsed")

    with col_ref:
        st.markdown('<div class="main-card" style="height: 100%; border-style: dashed; border-color: #444; text-align: center;">', unsafe_allow_html=True)
        st.markdown('<p class="input-label">Reference Support</p>', unsafe_allow_html=True)
        uploaded_file = st.file_uploader("Attach Material", type=['pdf', 'docx', 'txt'])
        if not uploaded_file:
            st.markdown("<br><p style='color: #555;'>NO FILES ATTACHED.</p>", unsafe_allow_html=True)
        st.markdown('</div>', unsafe_allow_html=True)
        
        st.markdown("<br>", unsafe_allow_html=True)
        if st.button("GENERATE PLAN"):
            if subject and topic_desc:
                with st.spinner("Processing ACE AI Engine..."):
                    model = genai.GenerativeModel('gemini-1.5-flash')
                    response = model.generate_content(f"School: {school}, Teacher: {instructor}, Grade: {grade}, Subject: {subject}, Framework: {framework}, Details: {topic_desc}")
                    st.session_state.result = response.text
            else:
                st.error("Please fill in the Subject and Topic.")

    # Output Section
    if 'result' in st.session_state:
        st.markdown("---")
        st.markdown('<p class="input-label">Generated Output</p>', unsafe_allow_html=True)
        st.markdown(st.session_state.result)
