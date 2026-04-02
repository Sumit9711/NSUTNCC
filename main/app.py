from flask import Flask, render_template, request, redirect, url_for, jsonify, send_file
import mysql.connector
import pandas as pd
import io
import os
import json
import re
import tempfile

from datetime import datetime
import json
app = Flask(__name__)

# ---- MySQL CONNECTION FUNCTION ----
def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",
        user="root",
        password="admin",
        database="NSUT_NCC"
    )
    return conn


IMAGE_EXTS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
 
def get_camps_dir():
    return os.path.join(app.root_path, 'static', 'images', 'camps')
 
def list_images(folder_path):
    try:
        files = os.listdir(folder_path)
    except FileNotFoundError:
        return []
    return sorted(
        f for f in files
        if os.path.splitext(f)[1].lower() in IMAGE_EXTS
    )

# ---- RANK PRIORITY MAP ----
RANK_PRIORITY = {
    'suo': 1,
    'juo': 2,
    'csm': 3,
    'chm': 3,
    'cqms': 4,
    'sergeant': 5,
    'sgt': 5,
    'corporal': 6,
    'cpl': 6,
    'lcpl': 7,
    'lance corporal': 7,
    'cadet': 8,
    'cdt': 8,
}

def get_rank_priority(rank_val):
    if not rank_val:
        return 99
    key = str(rank_val).strip().lower()
    return RANK_PRIORITY.get(key, 50)

def extract_dli_year(dli_val):
    if not dli_val:
        return 9999
    match = re.search(r'\d{4}', str(dli_val))
    if match:
        return int(match.group())
    return 9999


# =================== EXISTING ROUTES ===================

@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html', active_page='home')


@app.route('/uniform')
def uniform():
    return render_template('uniform.html', active_page='uniform')


# ============================================================
# RANKS ROUTE — replace your /ranks route in app.py
# ============================================================

@app.route('/ranks')
def ranks():
    session_label = request.args.get('session', None)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cursor.execute("SELECT id, label, is_current FROM rank_sessions ORDER BY label DESC")
    all_sessions = cursor.fetchall()

    if session_label:
        cursor.execute(
            "SELECT id, label FROM rank_sessions WHERE label = %s", (session_label,)
        )
    else:
        cursor.execute(
            "SELECT id, label FROM rank_sessions WHERE is_current = 1 LIMIT 1"
        )
    active_session = cursor.fetchone()

    if not active_session and all_sessions:
        active_session = all_sessions[0]

    rank_holders = []
    if active_session:
        cursor.execute(
            """
            SELECT rank_title, name, photo, rank_order, year_batch
            FROM rank_holders
            WHERE session_id = %s
            ORDER BY rank_order ASC, name ASC
            """,
            (active_session['id'],)
        )
        rank_holders = cursor.fetchall()

    cursor.close()
    conn.close()

    from collections import OrderedDict
    grouped = OrderedDict()
    for holder in rank_holders:
        title = holder['rank_title']
        if title not in grouped:
            grouped[title] = []
        grouped[title].append(holder)

    return render_template(
        'ranks.html',
        all_sessions=all_sessions,
        active_session=active_session,
        grouped=grouped,
        active_page='ranks'
    )

@app.route("/cadets")
def cadets():
    year = request.args.get("year")
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cadets = []
    if year == 'all':
        cursor.execute("SELECT * FROM CADETS ORDER BY dli")
        cadets = cursor.fetchall()
    elif year:
        cursor.execute("SELECT * FROM CADETS WHERE year = %s ORDER BY dli", (year,))
        cadets = cursor.fetchall()

    cursor.close()
    conn.close()
    return render_template("cadets.html", cadets=cadets, selected_year=year, active_page='cadets')


@app.route('/attendance')
def attendance():
    return render_template('attendance.html', active_page='attendance')
 
 
# ── GET CADETS BY YEAR ───────────────────────────────────────
@app.route('/attendance/cadets')
def attendance_cadets():
    year = request.args.get('year', '')
    if year not in ('1', '2', '3'):
        return jsonify({'error': 'Invalid year'}), 400
 
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        "SELECT id, name, dli, year, _rank FROM CADETS WHERE year=%s ORDER BY name",
        (year,)
    )
    cadets = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(cadets)
 
 
# ── GET SESSIONS FOR A MONTH ─────────────────────────────────
@app.route('/attendance/sessions')
def attendance_sessions():
    year  = request.args.get('year',  '')   # calendar year e.g. "2025"
    month = request.args.get('month', '')   # "1"–"12"
 
    if not year or not month:
        return jsonify([])
 
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT id, DATE_FORMAT(date,'%%Y-%%m-%%d') AS date, notes
        FROM class_sessions
        WHERE YEAR(date)=%s AND MONTH(date)=%s
        ORDER BY date
        """,
        (year, month)
    )
    sessions = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(sessions)
 
 
# ── ADD A NEW SESSION DATE ───────────────────────────────────
@app.route('/attendance/sessions/add', methods=['POST'])
def attendance_add_session():
    data  = request.get_json()
    date  = data.get('date', '').strip()
    notes = data.get('notes', '').strip()
 
    if not date:
        return jsonify({'error': 'Date required'}), 400
 
    try:
        datetime.strptime(date, '%Y-%m-%d')
    except ValueError:
        return jsonify({'error': 'Invalid date format'}), 400
 
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    try:
        cursor.execute(
            "INSERT INTO class_sessions (date, notes) VALUES (%s, %s)",
            (date, notes or None)
        )
        conn.commit()
        session_id = cursor.lastrowid
    except conn.connector.IntegrityError:
        cursor.close(); conn.close()
        return jsonify({'error': 'Session for this date already exists'}), 409
    except Exception as e:
        cursor.close(); conn.close()
        return jsonify({'error': str(e)}), 500
 
    cursor.close(); conn.close()
    return jsonify({'id': session_id, 'date': date, 'notes': notes})
 
 
# ── GET EXISTING ATTENDANCE FOR ONE SESSION ──────────────────
@app.route('/attendance/records')
def attendance_records():
    session_id = request.args.get('session_id', '')
    cadet_year = request.args.get('year', '')
 
    if not session_id or cadet_year not in ('1','2','3'):
        return jsonify([])
 
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute(
        """
        SELECT c.id, c.name, c.dli, c.year, c._rank,
               IFNULL(a.status, 'A') AS status
        FROM CADETS c
        LEFT JOIN attendance a
          ON a.cadet_id = c.id AND a.session_id = %s
        WHERE c.year = %s
        ORDER BY c.name
        """,
        (session_id, cadet_year)
    )
    records = cursor.fetchall()
    cursor.close(); conn.close()
    return jsonify(records)
 
 
# ── MARK / SAVE ATTENDANCE ───────────────────────────────────
@app.route('/attendance/mark', methods=['POST'])
def attendance_mark():
    data       = request.get_json()
    session_id = data.get('session_id')
    records    = data.get('records', [])   # [{cadet_id, status}, ...]
 
    if not session_id or not records:
        return jsonify({'error': 'Missing data'}), 400
 
    conn   = get_db_connection()
    cursor = conn.cursor()
    try:
        for rec in records:
            cursor.execute(
                """
                INSERT INTO attendance (cadet_id, session_id, status)
                VALUES (%s, %s, %s)
                ON DUPLICATE KEY UPDATE status = VALUES(status)
                """,
                (rec['cadet_id'], session_id, rec['status'])
            )
        conn.commit()
    except Exception as e:
        conn.rollback()
        cursor.close(); conn.close()
        return jsonify({'error': str(e)}), 500
 
    cursor.close(); conn.close()
    return jsonify({'saved': len(records)})
 
 
# ── ANALYTICS FOR A MONTH ────────────────────────────────────
@app.route('/attendance/analytics')
def attendance_analytics():
    cal_year   = request.args.get('year', '')
    month      = request.args.get('month', '')
    cadet_year = request.args.get('cadet_year', '')
 
    if not cal_year or not month or cadet_year not in ('1','2','3'):
        return jsonify({'error': 'Missing params'}), 400
 
    conn   = get_db_connection()
    cursor = conn.cursor(dictionary=True)
 
    # Total sessions in month
    cursor.execute(
        """
        SELECT COUNT(*) AS total
        FROM class_sessions
        WHERE YEAR(date)=%s AND MONTH(date)=%s
        """,
        (cal_year, month)
    )
    total_sessions = cursor.fetchone()['total']
 
    # Per-cadet attendance count
    cursor.execute(
        """
        SELECT c.id, c.name, c.dli, c._rank,
               COUNT(a.id)                                   AS attended,
               %s                                            AS total,
               ROUND(COUNT(a.id) * 100.0 / NULLIF(%s,0), 1) AS pct
        FROM CADETS c
        LEFT JOIN attendance a
          ON  a.cadet_id  = c.id
          AND a.status    = 'P'
          AND a.session_id IN (
              SELECT id FROM class_sessions
              WHERE YEAR(date)=%s AND MONTH(date)=%s
          )
        WHERE c.year = %s
        GROUP BY c.id, c.name, c.dli, c._rank
        ORDER BY pct DESC, c.name
        """,
        (total_sessions, total_sessions, cal_year, month, cadet_year)
    )
    cadets = cursor.fetchall()
    cursor.close(); conn.close()
 
    return jsonify({
        'total_sessions': total_sessions,
        'cadets': cadets,
    })

@app.route('/events')
def events():
    return render_template('events.html')


@app.route('/drills')
def drills():
    return render_template('drills.html')


@app.route('/camps')
def camps():
    camps_dir = get_camps_dir()
    camps_list = []
 
    try:
        entries = sorted(os.listdir(camps_dir))
    except FileNotFoundError:
        entries = []
      
    for entry in entries:
        entry_path = os.path.join(camps_dir, entry)
        if not os.path.isdir(entry_path):
            continue
 
        images = list_images(entry_path)
 
        camps_list.append({
            'name':       entry.upper().replace('_', ' '),
            'folder':     entry,
            'cover_file': images[0] if images else None,  # just "1.jpg"
            'count':      len(images),
        })
 
    return render_template('camps.html', camps=camps_list, active_page='camps')
 
  


# ── NEW ROUTE: individual camp gallery ──────────────────────────
@app.route('/camp/<camp_name>')
def camp_gallery(camp_name):
    safe_name = ''.join(c for c in camp_name if c.isalnum() or c in '-_')
    if not safe_name:
        return "Invalid camp name", 400
 
    camp_path = os.path.join(get_camps_dir(), safe_name)
    if not os.path.isdir(camp_path):
        return "Camp not found", 404
 
    image_files = list_images(camp_path)
 
    return render_template(
        'camp_gallery.html',
        camp_name=safe_name.upper().replace('_', ' '),
        camp_folder=safe_name,
        images=image_files,   # just filenames: ["1.jpg", "2.jpg", ...]
        active_page='camps',
    )
 

@app.route('/contact')
def contact():
    return render_template('contact.html')

@app.route('/debug-camps')
def debug_camps():
    import os
    camps_dir = os.path.join(app.root_path, 'static', 'images', 'camps')
    exists = os.path.exists(camps_dir)
    files = os.listdir(camps_dir) if exists else []
    return f"Path: {camps_dir}<br>Exists: {exists}<br>Contents: {files}"

@app.route('/admin')
def admin_dashboard():
    return render_template('admin_dashboard.html', active_page='admin')


# =================== NOMINAL ROLL ROUTES ===================

@app.route('/admin/nominal-roll')
def nominal_roll():
    return render_template('nominal_roll.html', active_page='admin')


@app.route('/admin/nominal-roll/upload', methods=['POST'])
def upload_excel():
    """Upload Excel, return columns + cadet list as JSON."""
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    f = request.files['file']
    if f.filename == '':
        return jsonify({'error': 'Empty filename'}), 400

    if not f.filename.lower().endswith(('.xlsx', '.xls', '.csv')):
        return jsonify({'error': 'Invalid file type. Upload .xlsx, .xls or .csv'}), 400

    try:
        if f.filename.lower().endswith('.csv'):
            df = pd.read_csv(f)
        else:
            df = pd.read_excel(f)

        if df.empty:
            return jsonify({'error': 'File is empty or has no data rows'}), 400

        df = df.fillna('')
        columns = list(df.columns)
        records = df.to_dict(orient='records')

        # Store in session-like temp file
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix='.json',
        dir=tempfile.gettempdir(),
        prefix='ncc_roll_')
        tmp.write(json.dumps({'columns': columns, 'records': records}).encode())
        tmp.close()

        return jsonify({
            'success': True,
            'columns': columns,
            'cadets': records,
            'temp_file': os.path.basename(tmp.name),
            'total': len(records)
        })

    except Exception as e:
        return jsonify({'error': f'Failed to read file: {str(e)}'}), 500


@app.route('/admin/nominal-roll/generate', methods=['POST'])
def generate_nominal_roll():
    """Generate sorted, filtered Excel from selected cadets + columns."""
    data = request.get_json()
    if not data:
        return jsonify({'error': 'No data received'}), 400

    temp_file = data.get('temp_file')
    selected_ids = data.get('selected_ids', [])   # list of row indices (0-based)
    selected_cols = data.get('columns', [])        # ordered list of column names
    sort_by = data.get('sort_by', 'none')          # 'rank' | 'dli' | 'none'
    serial_col = data.get('serial_col', True)      # add S.No column

    if not temp_file:
        return jsonify({'error': 'Session expired. Please re-upload the file.'}), 400

    tmp_path = os.path.join(tempfile.gettempdir(), temp_file)
    if not os.path.exists(tmp_path):
        return jsonify({'error': 'Temp file not found. Please re-upload.'}), 400

    try:
        with open(tmp_path, 'r') as fp:
            payload = json.load(fp)

        all_records = payload['records']

        # ---- Filter selected cadets ----
        if selected_ids:
            records = [all_records[i] for i in selected_ids if i < len(all_records)]
        else:
            return jsonify({'error': 'No cadets selected'}), 400

        df = pd.DataFrame(records)

        # ---- Column selection & ordering ----
        if selected_cols:
            valid_cols = [c for c in selected_cols if c in df.columns]
            if not valid_cols:
                return jsonify({'error': 'None of the selected columns exist in the data'}), 400
            df = df[valid_cols]

        # ---- Sorting ----
        if sort_by == 'rank':
            rank_col = next((c for c in df.columns if 'rank' in c.lower()), None)
            if rank_col:
                df['_rank_priority'] = df[rank_col].apply(get_rank_priority)
                df = df.sort_values('_rank_priority').drop(columns=['_rank_priority'])
            # If no rank column, skip sorting gracefully

        elif sort_by == 'dli':
            dli_col = next((c for c in df.columns if 'dli' in c.lower()), None)
            if dli_col:
                df['_dli_year'] = df[dli_col].apply(extract_dli_year)
                df = df.sort_values('_dli_year').drop(columns=['_dli_year'])

        # ---- Add serial number ----
        if serial_col:
            df.insert(0, 'S.No', range(1, len(df) + 1))

        # ---- Write to Excel in memory ----
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df.to_excel(writer, index=False, sheet_name='Nominal Roll')

            # Style the header
            workbook = writer.book
            worksheet = writer.sheets['Nominal Roll']
            from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
            header_font = Font(bold=True, color='FFFFFF', size=11)
            header_fill = PatternFill(start_color='1E3A1E', end_color='1E3A1E', fill_type='solid')
            border = Border(
                left=Side(style='thin'), right=Side(style='thin'),
                top=Side(style='thin'), bottom=Side(style='thin')
            )
            for col_num, cell in enumerate(worksheet[1], 1):
                cell.font = header_font
                cell.fill = header_fill
                cell.alignment = Alignment(horizontal='center', vertical='center')
                cell.border = border
                # Auto-width
                col_letter = cell.column_letter
                worksheet.column_dimensions[col_letter].width = max(15, len(str(cell.value)) + 4)

            # Style data rows
            alt_fill = PatternFill(start_color='F0F4EC', end_color='F0F4EC', fill_type='solid')
            for row_idx, row in enumerate(worksheet.iter_rows(min_row=2), 2):
                for cell in row:
                    cell.border = border
                    cell.alignment = Alignment(horizontal='center', vertical='center')
                    if row_idx % 2 == 0:
                        cell.fill = alt_fill

            worksheet.freeze_panes = 'A2'

        output.seek(0)
        return send_file(
            output,
            mimetype='application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            as_attachment=True,
            download_name='NSUT_NCC_Nominal_Roll.xlsx'
        )

    except Exception as e:
        return jsonify({'error': f'Generation failed: {str(e)}'}), 500

    finally:
        # Cleanup temp file
        try:
            if os.path.exists(tmp_path):
                os.remove(tmp_path)
        except Exception:
            pass


if __name__ == '__main__':
    app.run(debug=True)