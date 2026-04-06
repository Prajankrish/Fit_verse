from ml.body_analyzer import BodyAnalyzer, HeightEstimator
from ml.body_classifier import BodyTypeClassifier

try:
    print('Testing ML imports...')
    analyzer = BodyAnalyzer()
    classifier = BodyTypeClassifier()
    print('Imports and inits OK')
except Exception as e:
    print(f'Error: {e}')
