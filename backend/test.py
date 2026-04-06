from ml.body_classifier import BodyTypeClassifier
classifier = BodyTypeClassifier()
print(classifier.classify({}, 165))
print(classifier.detect_gender({}))
