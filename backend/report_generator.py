import os
import io
import qrcode
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime, timedelta
from sqlalchemy import func
from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Image, Table, TableStyle, PageBreak, PageTemplate, Frame
from reportlab.lib.units import inch
from reportlab.pdfgen import canvas

from database import SessionLocal
from models import Reading, ApplianceUsage, User
from prediction import predict_next_3_months
from scoring import get_badge_and_rank

# --- CONFIGURATION & STYLES ---
COLORS = {
    'primary': colors.HexColor('#10b981'),      # Emerald 500
    'primary_dark': colors.HexColor('#065f46'), # Emerald 900
    'primary_light': colors.HexColor('#ecfdf5'),# Emerald 50
    'secondary': colors.HexColor('#059669'),    # Emerald 600
    'accent': colors.HexColor('#3b82f6'),       # Blue 500
    'danger': colors.HexColor('#ef4444'),       # Red 500
    'warning': colors.HexColor('#f59e0b'),      # Amber 500
    'text_main': colors.HexColor('#1f2937'),    # Gray 800
    'text_muted': colors.HexColor('#6b7280'),   # Gray 500
    'bg_light': colors.HexColor('#f9fafb'),     # Gray 50
    'white': colors.HexColor('#ffffff'),
    'border': colors.HexColor('#e5e7eb')        # Gray 200
}

def get_styles():
    styles = getSampleStyleSheet()
    
    # Custom Heading 1 (Cover Title)
    styles.add(ParagraphStyle(
        name='PremiumTitle',
        parent=styles['Heading1'],
        fontSize=36,
        leading=42,
        textColor=COLORS['primary_dark'],
        alignment=1, # Center
        spaceAfter=20,
        fontName='Helvetica-Bold'
    ))
    
    # Section Header
    styles.add(ParagraphStyle(
        name='SectionHeader',
        parent=styles['Heading2'],
        fontSize=18,
        leading=22,
        textColor=COLORS['primary'],
        spaceBefore=20,
        spaceAfter=12,
        borderPadding=(0, 0, 5, 0),
        fontName='Helvetica-Bold'
    ))

    # Metric Label
    styles.add(ParagraphStyle(
        name='MetricLabel',
        fontSize=10,
        textColor=COLORS['text_muted'],
        alignment=1,
        fontName='Helvetica'
    ))

    # Metric Value
    styles.add(ParagraphStyle(
        name='MetricValue',
        fontSize=16,
        textColor=COLORS['primary_dark'],
        alignment=1,
        fontName='Helvetica-Bold'
    ))

    # AI Insight Box
    styles.add(ParagraphStyle(
        name='AIInsight',
        fontSize=11,
        textColor=COLORS['primary_dark'],
        backColor=COLORS['primary_light'],
        borderPadding=10,
        borderRadius=8,
        leading=16,
        fontName='Helvetica-Oblique',
        spaceBefore=10,
        spaceAfter=10
    ))

    # Footer
    styles.add(ParagraphStyle(
        name='FooterStyle',
        fontSize=8,
        textColor=COLORS['text_muted'],
        alignment=1
    ))

    return styles

# --- HELPER FUNCTIONS ---

def create_footer(canvas, doc):
    canvas.saveState()
    footer_text = f"UrjaIQ AI Energy Intelligence Report | Generated on {datetime.now().strftime('%Y-%m-%d')} | Page {doc.page}"
    canvas.setFont('Helvetica', 8)
    canvas.setFillColor(COLORS['text_muted'])
    canvas.drawCentredString(A4[0]/2, 0.5*inch, footer_text)
    canvas.restoreState()

def generate_qr(data_str, report_dir, user_id):
    qr = qrcode.QRCode(version=1, box_size=10, border=2)
    qr.add_data(data_str)
    qr.make(fit=True)
    img = qr.make_image(fill_color="#065f46", back_color="white")
    path = os.path.join(report_dir, f"qr_{user_id}_{datetime.now().strftime('%H%M%S')}.png")
    img.save(path)
    return path

def get_persona(green_score, units, carbon_kg):
    if green_score >= 85:
        return "Eco Warrior", "You are an energy superstar! Your consumption is highly optimized, and your carbon footprint is remarkably low. You lead by example in sustainable living."
    elif green_score >= 65 and units < 300:
        return "Smart Saver", "You have a keen eye for efficiency. You balance comfort with cost-effectiveness, making smart choices that keep your bills and emissions in check."
    elif units > 500:
        return "Heavy Energy User", "Your energy demand is significant. While this might be due to a large household, there is substantial room for AI-driven optimization to reduce waste."
    else:
        return "Balanced Consumer", "You represent the typical efficient household. You use energy where needed but stay mindful. Small adjustments could push you into the 'Eco Warrior' tier."

# --- MAIN GENERATOR ---

def get_premium_badge(score):
    if score >= 90: return "S-Tier Efficiency", "Eco Champion"
    if score >= 75: return "A-Tier Efficiency", "Energy Saver"
    if score >= 50: return "B-Tier Efficiency", "Balanced User"
    return "C-Tier Efficiency", "High Consumer"

def generate_user_report(user_id: int):
    db = SessionLocal()
    try:
        # 1. Fetch User Data
        user = db.query(User).filter(User.id == user_id).first()
        if not user: return None
        
        latest = db.query(Reading).filter(Reading.user_id == user_id).order_by(Reading.id.desc()).first()
        if not latest: return None
        
        history = db.query(Reading).filter(Reading.user_id == user_id).order_by(Reading.id.desc()).limit(6).all()
        history.reverse()
        
        appliances = db.query(ApplianceUsage).filter(ApplianceUsage.reading_id == latest.id).all()
        
        # Benchmarks
        city_avg = db.query(func.avg(Reading.units)).filter(Reading.city == latest.city).scalar() or 250
        nat_avg = db.query(func.avg(Reading.units)).scalar() or 300
        
        # 1. Data Preparation (Safely handle None values)
        units = latest.units or 0
        bill = latest.total_bill or 0
        city = latest.city or "Unknown"
        carbon_kg = latest.carbon_kg if latest.carbon_kg is not None else round(units * 0.82, 1)
        green_score = latest.green_score if latest.green_score is not None else 50
        renewable_potential = latest.renewable_potential if latest.renewable_potential is not None else 0
        trees = round(carbon_kg / 21) if carbon_kg > 0 else 0
        username = user.username if user else "UrjaIQ User"
        yearly_savings = round(bill * 0.25 * 12)
        
        # 2. Setup Document
        timestamp = datetime.now().strftime('%Y%m%d_%H%M')
        filename = f"UrjaIQ_Premium_Report_{user_id}_{timestamp}.pdf"
        report_dir = os.path.join(os.path.dirname(os.path.abspath(__file__)), "reports")
        if not os.path.exists(report_dir): os.makedirs(report_dir)
        filepath = os.path.join(report_dir, filename)
        
        doc = SimpleDocTemplate(filepath, pagesize=A4, rightMargin=50, leftMargin=50, topMargin=50, bottomMargin=50)
        styles = get_styles()
        elements = []
        chart_paths = []

        # --- PAGE 1: PREMIUM COVER ---
        elements.append(Spacer(1, 1.5 * inch))
        # App Logo Placeholder (Text for now)
        elements.append(Paragraph("<font color='#10b981' size='24'>UrjaIQ</font>", styles['PremiumTitle']))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph("AI Energy Intelligence Report", styles['PremiumTitle']))
        elements.append(Spacer(1, 0.5 * inch))
        
        # Cover Info Table
        cover_data = [
            [Paragraph(f"<b>USER:</b> {user.username}", styles['Normal']), Paragraph(f"<b>CITY:</b> {latest.city or 'Unknown'}", styles['Normal'])],
            [Paragraph(f"<b>DATE:</b> {datetime.now().strftime('%B %d, %Y')}", styles['Normal']), Paragraph(f"<b>REPORT ID:</b> #UIQ-{user_id}-{timestamp}", styles['Normal'])]
        ]
        t_cover = Table(cover_data, colWidths=[2.5*inch, 2.5*inch])
        t_cover.setStyle(TableStyle([
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
        ]))
        elements.append(t_cover)
        elements.append(Spacer(1, 1 * inch))
        
        # Hero Score Badge
        badge_title, badge_rank = get_premium_badge(green_score)
        elements.append(Paragraph(f"<font color='#059669' size='60'>{green_score}</font>", styles['PremiumTitle']))
        elements.append(Paragraph("AI GREEN SCORE", styles['MetricLabel']))
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(f"<b>Status:</b> {badge_title}", styles['SectionHeader']))
        elements.append(Paragraph(f"<b>AI Badge:</b> {badge_rank}", styles['SectionHeader']))
        
        elements.append(PageBreak())

        # --- PAGE 2: EXECUTIVE SUMMARY & PERSONA ---
        elements.append(Paragraph("Executive Summary", styles['SectionHeader']))
        
        # Metrics Cards (Grid layout using Table)
        metric_data = [
            [Paragraph("Monthly Usage", styles['MetricLabel']), Paragraph("Est. Bill", styles['MetricLabel']), Paragraph("Green Score", styles['MetricLabel'])],
            [Paragraph(f"{units} kWh", styles['MetricValue']), Paragraph(f"₹{bill}", styles['MetricValue']), Paragraph(f"{green_score}", styles['MetricValue'])],
            [Spacer(1, 15), Spacer(1, 15), Spacer(1, 15)],
            [Paragraph("CO₂ Footprint", styles['MetricLabel']), Paragraph("Solar Potential", styles['MetricLabel']), Paragraph("Yearly Saving", styles['MetricLabel'])],
            [Paragraph(f"{carbon_kg} kg", styles['MetricValue']), Paragraph(f"{renewable_potential} kWh", styles['MetricValue']), Paragraph(f"₹{yearly_savings}", styles['MetricValue'])]
        ]
        t_metrics = Table(metric_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch])
        t_metrics.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), COLORS['bg_light']),
            ('BOX', (0,0), (-1,-1), 1, COLORS['border']),
            ('INNERGRID', (0,0), (-1,-1), 0.5, COLORS['border']),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('TOPPADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(t_metrics)
        elements.append(Spacer(1, 0.5 * inch))

        # AI Persona
        p_name, p_desc = get_persona(green_score, units, carbon_kg)
        elements.append(Paragraph(f"AI Persona: {p_name}", styles['SectionHeader']))
        elements.append(Paragraph(p_desc, styles['Normal']))
        efficiency_diff = round(abs(1 - (units / city_avg if city_avg > 0 else 1)) * 100)
        elements.append(Paragraph(f"💡 <b>AI Insight:</b> Your usage pattern is {efficiency_diff}% {'more' if units < city_avg else 'less'} efficient than your neighbors in {city}.", styles['AIInsight']))

        # --- PAGE 3: ADVANCED VISUALS ---
        elements.append(Paragraph("Consumption Intelligence", styles['SectionHeader']))
        
        # Chart 1: Smooth Trend
        plt.figure(figsize=(10, 5))
        dates = [r.created_at.strftime('%b') for r in history]
        units_list = [r.units for r in history]
        plt.plot(dates, units_list, marker='o', color='#10b981', linewidth=4, markersize=10, label='Units (kWh)')
        plt.fill_between(dates, units_list, color='#10b981', alpha=0.1)
        plt.title("6-Month Energy Trend", fontsize=14, fontweight='bold', pad=20)
        plt.grid(axis='y', linestyle='--', alpha=0.3)
        plt.gca().spines['top'].set_visible(False)
        plt.gca().spines['right'].set_visible(False)
        trend_path = os.path.join(report_dir, f"chart_trend_{user_id}_{timestamp}.png")
        plt.savefig(trend_path, bbox_inches='tight', dpi=150)
        plt.close()
        chart_paths.append(trend_path)
        elements.append(Image(trend_path, width=6*inch, height=3*inch))
        elements.append(Paragraph("<b>AI Trend Analysis:</b> Your consumption shows a seasonal variance. The peak in recent months suggests cooling load (AC) dependency. Transitioning to 5-star inverter models could save ₹450/month.", styles['AIInsight']))

        elements.append(PageBreak())

        # Chart 2: Donut Chart for Appliances
        if appliances:
            elements.append(Paragraph("Appliance Breakdown", styles['SectionHeader']))
            labels = [a.appliance for a in appliances]
            sizes = [a.units for a in appliances]
            colors_list = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
            
            plt.figure(figsize=(8, 8))
            plt.pie(sizes, labels=labels, colors=colors_list, autopct='%1.1f%%', startangle=140, pctdistance=0.85, wedgeprops=dict(width=0.3, edgecolor='w'))
            plt.title("Energy Distribution by Appliance", fontsize=16, fontweight='bold')
            app_path = os.path.join(report_dir, f"chart_app_{user_id}_{timestamp}.png")
            plt.savefig(app_path, bbox_inches='tight', dpi=150)
            plt.close()
            chart_paths.append(app_path)
            elements.append(Image(app_path, width=4*inch, height=4*inch))
            
            main_app = max(appliances, key=lambda x: x.units).appliance
            elements.append(Paragraph(f"<b>AI Insight:</b> {main_app} is your biggest energy consumer. Reducing its usage by just 1 hour daily will lower your monthly bill by approx ₹{round(bill * 0.12)}.", styles['AIInsight']))

        # --- PAGE 4: SAVINGS & RECOMMENDATIONS ---
        elements.append(Paragraph("AI Savings Roadmap", styles['SectionHeader']))
        
        rec_data = [
            ["Recommendation", "Monthly Saving", "Impact", "Difficulty"],
            ["Switch to 5-Star Inverter AC", "₹850", "High", "Hard"],
            ["Install BLDC Ceiling Fans", "₹120", "Medium", "Easy"],
            ["Optimize Fridge Temperature", "₹45", "Low", "Easy"],
            ["Rooftop Solar (3kW)", "₹2,100", "Critical", "Medium"]
        ]
        t_rec = Table(rec_data, colWidths=[2.2*inch, 1.2*inch, 1*inch, 1*inch])
        t_rec.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,0), COLORS['primary']),
            ('TEXTCOLOR', (0,0), (-1,0), COLORS['white']),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
            ('FONTSIZE', (0,0), (-1,0), 12),
            ('BOTTOMPADDING', (0,0), (-1,-1), 10),
            ('BACKGROUND', (0,1), (-1,-1), COLORS['bg_light']),
            ('GRID', (0,0), (-1,-1), 0.5, COLORS['border']),
        ]))
        elements.append(t_rec)
        elements.append(Spacer(1, 0.2 * inch))
        elements.append(Paragraph(f"<b>Potential Annual Savings:</b> <font color='#10b981'><b>₹{yearly_savings}</b></font>", styles['Normal']))

        # --- PAGE 5: CARBON & COMPARISON ---
        elements.append(Paragraph("Sustainability Intelligence", styles['SectionHeader']))
        carbon_data = [
            [Paragraph("Carbon Emitted", styles['MetricLabel']), Paragraph("Trees to Offset", styles['MetricLabel']), Paragraph("Petrol Equivalent", styles['MetricLabel'])],
            [Paragraph(f"{carbon_kg} kg CO₂", styles['MetricValue']), Paragraph(f"{trees} Trees", styles['MetricValue']), Paragraph(f"{round(carbon_kg/2.3, 1)} L", styles['MetricValue'])]
        ]
        t_carbon = Table(carbon_data, colWidths=[1.8*inch, 1.8*inch, 1.8*inch])
        t_carbon.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor('#f0fdf4')), # Green 50
            ('BOX', (0,0), (-1,-1), 1, COLORS['primary']),
            ('ALIGN', (0,0), (-1,-1), 'CENTER'),
            ('VALIGN', (0,0), (-1,-1), 'MIDDLE'),
            ('PADDING', (0,0), (-1,-1), 10),
        ]))
        elements.append(t_carbon)
        elements.append(Spacer(1, 0.5 * inch))

        # Risk Analysis
        elements.append(Paragraph("AI Risk Analysis", styles['SectionHeader']))
        risk_color = COLORS['danger'] if units > 400 else COLORS['warning']
        risk_text = "HIGH" if units > 400 else "MEDIUM"
        elements.append(Paragraph(f"<font color='{risk_color}'><b>[!] SLAB CROSSING RISK: {risk_text}</b></font>", styles['Normal']))
        elements.append(Paragraph("Your current usage is dangerously close to the higher tariff slab (₹7.50/unit). Reducing 15 units will save you ₹340 instantly.", styles['Normal']))

        # --- FINAL PAGE: CONCLUSION & QR ---
        elements.append(PageBreak())
        elements.append(Paragraph("AI Consultant Final Review", styles['SectionHeader']))
        
        conclusion = (
            f"Based on our AI analysis, {username}, your household's energy efficiency is commendable but has specific gaps. "
            f"The primary driver of waste is your peak-hour consumption. We recommend shifting heavy loads (Washing Machine, Pump) "
            f"to non-peak hours (11 AM - 3 PM). Your home has {renewable_potential} kWh of solar potential, which could "
            f"eliminate 80% of your bill. UrjaIQ recommends a 3kW hybrid system for your residence in {city}."
        )
        elements.append(Paragraph(conclusion, styles['Normal']))
        elements.append(Spacer(1, 1 * inch))
        
        # QR Code Section
        report_url = f"http://127.0.0.1:8000/reports/{filename}"
        qr_path = generate_qr(report_url, report_dir, user_id)
        chart_paths.append(qr_path)
        
        qr_table_data = [[Image(qr_path, width=1.5*inch, height=1.5*inch), Paragraph("<b>Scan to Share Report</b><br/>Open this AI report on your mobile device or share it instantly on WhatsApp.", styles['Normal'])]]
        t_qr = Table(qr_table_data, colWidths=[1.8*inch, 3.5*inch])
        t_qr.setStyle(TableStyle([('VALIGN', (0,0), (-1,-1), 'MIDDLE')]))
        elements.append(t_qr)

        # Build PDF
        doc.build(elements, onFirstPage=create_footer, onLaterPages=create_footer)
        print(f"PREMIUM PDF GENERATED: {filename}")
        
        # Cleanup charts (optional - keep for debugging or remove)
        # for p in chart_paths: os.remove(p)
        
        return filename

    except Exception as e:
        import traceback
        print(f"PREMIUM PDF ERROR: {e}")
        traceback.print_exc()
        return None
    finally:
        db.close()
