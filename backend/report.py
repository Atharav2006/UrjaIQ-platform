import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer
from reportlab.lib.styles import getSampleStyleSheet

def generate_pdf(data: dict) -> str:
    """
    Generates a structured PDF report for the UrjaIQ energy analysis.
    """
    file_path = "report.pdf"
    
    doc = SimpleDocTemplate(file_path, pagesize=letter)
    styles = getSampleStyleSheet()
    
    # Standard styles
    title_style = styles['Title']
    heading_style = styles['Heading2']
    normal_style = styles['Normal']
    
    story = []
    # --- TITLE SECTION ---
    story.append(Paragraph("UrjaIQ Energy Report", title_style))
    story.append(Spacer(1, 20))
    
    # 1. User Details
    story.append(Paragraph("1. User Details", heading_style))
    story.append(Paragraph(f"<b>Units Consumed:</b> {data.get('units', 'N/A')} kWh", normal_style))
    story.append(Paragraph(f"<b>City:</b> {data.get('city', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Household Type:</b> {data.get('household_type', 'N/A')}", normal_style))
    story.append(Spacer(1, 15))
    
    # 2. Bill Summary
    story.append(Paragraph("2. Bill Summary", heading_style))
    story.append(Paragraph(f"<b>Total Estimated Bill:</b> ₹{data.get('total_bill', 'N/A')}", normal_style))
    story.append(Spacer(1, 15))
    
    # 3. Performance
    story.append(Paragraph("3. Performance", heading_style))
    story.append(Paragraph(f"<b>Percentile Ranking:</b> {data.get('percentile', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>UrjaIQ Score:</b> {data.get('score', 'N/A')}/100", normal_style))
    story.append(Paragraph(f"<b>Grade:</b> {data.get('grade', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Benchmark:</b> {data.get('benchmark_message', '')}", normal_style))
    story.append(Spacer(1, 15))
    
    # 4. Prediction
    story.append(Paragraph("4. Prediction", heading_style))
    predicted = data.get('predicted_units')
    if predicted:
        story.append(Paragraph(f"<b>Expected Usage:</b> ~{predicted} kWh", normal_style))
    else:
        story.append(Paragraph("Not enough data for prediction", normal_style))
    story.append(Spacer(1, 15))
    
    # 5. Anomaly
    story.append(Paragraph("5. Anomaly Detection", heading_style))
    story.append(Paragraph(f"<b>Status:</b> {data.get('anomaly_message', 'N/A')}", normal_style))
    story.append(Spacer(1, 15))
    
    # 6. Sustainability
    story.append(Paragraph("6. Sustainability & Environmental Impact", heading_style))
    story.append(Paragraph(f"<b>Carbon Footprint:</b> {data.get('carbon_kg', 'N/A')} kg CO2", normal_style))
    story.append(Paragraph(f"<b>Green Score:</b> {data.get('green_score', 'N/A')}/100", normal_style))
    story.append(Paragraph(f"<b>Eco Badge:</b> {data.get('eco_badge', 'N/A')}", normal_style))
    story.append(Paragraph(f"<b>Environmental Impact:</b> Equivalent to {data.get('trees_required', 'N/A')} trees needed for offset per month.", normal_style))
    
    solar = data.get('solar_recommendation', {})
    if solar.get('viable'):
        story.append(Paragraph(f"<b>Solar Potential:</b> Recommended {solar.get('recommended_kw')} kW system", normal_style))
        story.append(Paragraph(f"<b>Est. Monthly Savings:</b> ₹{solar.get('monthly_savings')}", normal_style))
    story.append(Spacer(1, 15))

    # 7. Recommendations
    story.append(Paragraph("7. Recommendations", heading_style))
    tips = data.get('tips', [])
    for tip in tips:
        story.append(Paragraph(f"• {tip}", normal_style))
        story.append(Spacer(1, 5))
    
    # Build and save PDF
    doc.build(story)
    
    return file_path
