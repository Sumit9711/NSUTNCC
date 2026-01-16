from flask import Flask, render_template, request, redirect, url_for
import mysql.connector

app = Flask(__name__)

# ---- MySQL CONNECTION FUNCTION ----
def get_db_connection():
    conn = mysql.connector.connect(
        host="localhost",       # agar local pe MySQL hai
        user="root",            # apna MySQL user
        password="admin",   # apna password
        database="NSUT_NCC"     # jo upar banaya
    )
    return conn



# # ----------------- ADMIN: Add new cadet (GET + POST) -----------------
# @app.route("/admin/cadets/add", methods=["GET", "POST"])
# def admin_add_cadet():
#     if request.method == "POST":
#         dli_no = request.form.get("dli_no")
#         name = request.form.get("name")
#         platoon = request.form.get("platoon")
#         year = request.form.get("year")
#         phone = request.form.get("phone")
#         email = request.form.get("email")

#         conn = get_db_connection()
#         cursor = conn.cursor()

#         sql = """
#         INSERT INTO cadets (dli_no, name, platoon, year, phone, email)
#         VALUES (%s, %s, %s, %s, %s, %s)
#         """
#         values = (dli_no, name, platoon, year, phone, email)

#         cursor.execute(sql, values)
#         conn.commit()

#         cursor.close()
#         conn.close()

#         return redirect(url_for("admin_cadets"))

#     # GET request pe form dikhao
#     return render_template("admin_add_cadet.html")

# # ----------------- ADMIN: View & update attendance -----------------
# @app.route("/admin/attendance", methods=["GET", "POST"])
# def admin_attendance():
#     conn = get_db_connection()
#     cursor = conn.cursor(dictionary=True)

#     if request.method == "POST":
#         cadet_id = request.form.get("cadet_id")
#         date = request.form.get("date")      # format: YYYY-MM-DD
#         status = request.form.get("status")  # 'P' ya 'A'

#         # Check if record already exists → UPDATE, nahi toh INSERT
#         check_sql = "SELECT id FROM attendance WHERE cadet_id = %s AND date = %s"
#         cursor.execute(check_sql, (cadet_id, date))
#         row = cursor.fetchone()

#         if row:
#             update_sql = "UPDATE attendance SET status = %s WHERE id = %s"
#             cursor.execute(update_sql, (status, row["id"]))
#         else:
#             insert_sql = """
#                 INSERT INTO attendance (cadet_id, date, status)
#                 VALUES (%s, %s, %s)
#             """
#             cursor.execute(insert_sql, (cadet_id, date, status))

#         conn.commit()

#     # Ab sab cadets ko attendance form ke liye lekar aa
#     cursor.execute("SELECT id, dli_no, name FROM cadets ORDER BY name")
#     cadets = cursor.fetchall()

#     cursor.close()
#     conn.close()

#     return render_template("admin_attenance.html", cadets=cadets)





@app.route('/')
@app.route('/home')
def home():
    return render_template('index.html' , active_page = 'home')


@app.route('/uniform')
def uniform():
    """Serves the uniform guide page."""
    return render_template('uniform.html' , active_page= 'uniform')

@app.route('/ranks')
def ranks():
    """Serves the ranks page."""
    return render_template('ranks.html' , active_page = 'ranks')

@app.route("/cadets")
def cadets():
    year = request.args.get("year")   # "1","2","3","all" or None
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    cadets = []
    if year == 'all':
        cursor.execute("SELECT * FROM CADETS ORDER BY dli")
        cadets = cursor.fetchall()
    elif year:
        cursor.execute("SELECT * FROM CADETS WHERE year = %s ORDER BY dli", (year,))
        cadets = cursor.fetchall()
    # else: year is None -> cadets stays empty

    cursor.close()
    conn.close()
    return render_template("cadets.html", cadets=cadets, selected_year=year, active_page = 'cadets')


@app.route('/attendance')
def attendance():
    """Serves the attendance page."""
    return render_template('attendance.html', active_page ='attendance')

@app.route('/events')
def events():
    """Serves the events page."""
    return render_template('events.html')

@app.route('/drills')
def drills():
    """Serves the drills page."""
    return render_template('drills.html')

@app.route('/camps')
def camps():
    """Serves the camps page."""
    return render_template('camps.html')

@app.route('/contact')
def contact():
    """Serves the contact page."""
    return render_template('contact.html')

# This part allows you to run the app directly
if __name__ == '__main__':
    app.run(debug=True)