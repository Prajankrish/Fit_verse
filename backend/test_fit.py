from pipeline import predict_fit
print(predict_fit({'chest': 84, 'waist': 64, 'hips': 88, 'height': 165}, {'specifications': {}}, '3XL')['fit_breakdown'])
