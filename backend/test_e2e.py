import requests, json

r = requests.post('http://localhost:8000/api/inspections/upload-image',
    data={'product_id': 'RELIFE-LAP-653F16'},
    files={'image': ('test.jpg', open('uploads/RELIFE-LAP-653F16_95d682bc.jpg','rb'), 'image/jpeg')},
    headers={'Authorization': 'Bearer demo_token'})

d = r.json()
print('Status:', r.status_code)
print('Defects:', len(d.get('defects',[])))
print('Decision:', d.get('decision',{}).get('recommended_pathway','N/A'))
print('Top Score:', d.get('decision',{}).get('top_composite_score','N/A'))
print('Has Critical:', d.get('decision',{}).get('has_critical_defect','N/A'))

opts = d.get('decision',{}).get('ranked_options',[])
for o in opts:
    print(f"  {o['pathway']}: NRV=Rs.{o['net_recovery_value']}, Score={o['composite_score']}, Env={o['environmental_score']}")
