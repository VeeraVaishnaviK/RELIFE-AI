import cv2
import numpy as np

def create_messy_laptop():
    # Load laptop
    laptop = cv2.imread('backend/uploads/RELIFE-LAP-42FB4E_e3dd2ce5.jpg')
    # Create realistic webcam cluttered frame: 720p (720, 1280, 3)
    frame = np.full((720, 1280, 3), (120, 115, 110), dtype=np.uint8) # indoor beige wall
    
    # Add room elements: desk wood surface at bottom
    frame[420:720, :] = (65, 80, 115) # darker desk surface
    
    # Add a person silhouette in background off to the side (simulating someone sitting or walking by)
    # head
    cv2.circle(frame, (1050, 220), 75, (170, 185, 205), -1)
    # torso with shirt
    cv2.rectangle(frame, (940, 290), (1160, 560), (140, 60, 50), -1) # dark red/blue shirt
    
    # Add books/clutter on desk
    cv2.rectangle(frame, (80, 480), (250, 620), (50, 120, 60), -1) # green notebook
    cv2.rectangle(frame, (230, 500), (330, 580), (180, 180, 180), -1) # white papers
    cv2.circle(frame, (380, 520), 35, (40, 70, 180), -1) # mug
    
    # Resize and place laptop on desk, tilted slightly / off-center
    resized_laptop = cv2.resize(laptop, (520, 340))
    # Add some dim lighting / slight noise
    resized_laptop = (resized_laptop * 0.85).astype(np.uint8)
    frame[310:650, 420:940] = resized_laptop
    
    # Add subtle webcam noise & vignette
    noise = np.random.normal(0, 8, frame.shape).astype(np.int16)
    frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    cv2.imwrite('test_images/messy_laptop_webcam.jpg', frame)
    print("Saved messy_laptop_webcam.jpg")

def create_messy_clothing():
    # Load clothing item (denim jacket / hoodie)
    jacket = cv2.imread('backend/uploads/RELIFE-SMA-DD3700_278704df.jpg')
    # Cluttered room frame
    frame = np.full((720, 1280, 3), (135, 130, 125), dtype=np.uint8)
    
    # Desk and office chair background
    frame[460:720, :] = (85, 75, 70) # floor/carpet
    
    # Chair back
    cv2.rectangle(frame, (450, 120), (830, 550), (40, 40, 45), -1) # black office chair back
    
    # Jacket draped over chair or held up
    resized_jacket = cv2.resize(jacket, (440, 440))
    resized_jacket = (resized_jacket * 0.9).astype(np.uint8)
    frame[180:620, 420:860] = resized_jacket
    
    # Add side clutter: lamp, monitor side
    cv2.rectangle(frame, (80, 200), (280, 550), (30, 30, 30), -1) # secondary monitor
    cv2.rectangle(frame, (960, 300), (1150, 650), (90, 110, 120), -1) # filing cabinet/shelf
    
    noise = np.random.normal(0, 7, frame.shape).astype(np.int16)
    frame = np.clip(frame.astype(np.int16) + noise, 0, 255).astype(np.uint8)
    cv2.imwrite('test_images/messy_clothes_webcam.jpg', frame)
    print("Saved messy_clothes_webcam.jpg")

if __name__ == "__main__":
    create_messy_laptop()
    create_messy_clothing()

