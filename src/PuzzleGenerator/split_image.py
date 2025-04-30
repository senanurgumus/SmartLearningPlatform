
import cv2
import os

def split_image(image_path, output_folder, grid_size=3):
    # Görseli yükle
    image = cv2.imread(image_path)
    if image is None:
        raise Exception("Görsel yüklenemedi. Dosya yolu doğru mu?")

    height, width = image.shape[:2]
    piece_width = width // grid_size
    piece_height = height // grid_size

    os.makedirs(output_folder, exist_ok=True)

    count = 1
    for row in range(grid_size):
        for col in range(grid_size):
            x = col * piece_width
            y = row * piece_height
            piece = image[y:y+piece_height, x:x+piece_width]
            filename = f"{output_folder}/piece{count}.png"
            cv2.imwrite(filename, piece)
            count += 1

    print(f"{count - 1} parça oluşturuldu ve {output_folder} klasörüne kaydedildi.")

# Örnek kullanım
split_image("input.jpg", "output_pieces", grid_size=3)
