import insightface
import cv2
import matplotlib.pyplot as plt
model = insightface.app.FaceAnalysis(allowed_modules=None, root="/home/nyavo/Documents/student-group/testa-be/models")
model.prepare(ctx_id=-1)
def vectorize_image(link,show_bounding_box:bool = False) -> list:
    image = cv2.imread(link)
    image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    faces = model.get(image)
    embeddings = []
    if (len(faces) > 0):
        for face in faces:
            bbox = face.bbox.astype(int)
            if (show_bounding_box) : cv2.rectangle(image, (bbox[0], bbox[1]), (bbox[2], bbox[3]), (0, 255, 0), 2)
            embeddings.append(face.embedding)
        if (show_bounding_box):
            plt.imshow(image)
            plt.axis('off')
            plt.title("Detected Faces")
            plt.show()
    return embeddings