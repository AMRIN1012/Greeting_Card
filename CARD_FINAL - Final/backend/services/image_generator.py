
import os
from PIL import Image, ImageDraw, ImageFont
import textwrap
import uuid

# Define Sizes
SIZES = {
    "square": (1080, 1080),
    "portrait": (1080, 1350),
    "landscape": (1200, 628)
}

def generate_card_images(recipient, occasion, message, sender, template_path):
    """
    Main logic for drawing text on template images.
    Returns list of generated filenames.
    """
    generated_files = []
    
    for size_name, dimensions in SIZES.items():
        w, h = dimensions
        
        # 1. Create/Load Image
        if os.path.exists(template_path):
            ext = os.path.splitext(template_path)[1].lower()
            if ext == '.svg':
                try:
                    import io
                    import cairosvg
                    # Rasterize SVG to PNG bytes at the requested size
                    png_bytes = cairosvg.svg2png(url=template_path, output_width=dimensions[0], output_height=dimensions[1])
                    img = Image.open(io.BytesIO(png_bytes)).convert('RGBA').resize(dimensions)
                except Exception as e:
                    # If cairosvg isn't available or conversion fails, fall back to a neutral background
                    img = Image.new('RGB', dimensions, color=(250, 250, 250))
            else:
                img = Image.open(template_path).resize(dimensions)
        else:
            # Create a fallback colored background if template missing
            img = Image.new('RGB', dimensions, color=(250, 250, 250))
            
        draw = ImageDraw.Draw(img)
        
        # 2. Setup Fonts (Relative to Height)
        try:
            # Note: In a real environment, you'd specify paths to .ttf files
            header_size = int(h * 0.04)
            main_size = int(h * 0.08)
            msg_size = int(h * 0.035)
            
            font_header = ImageFont.truetype("Arial.ttf", header_size)
            font_main = ImageFont.truetype("Arial.ttf", main_size)
            font_message = ImageFont.truetype("Arial.ttf", msg_size)
        except:
            font_header = ImageFont.load_default()
            font_main = ImageFont.load_default()
            font_message = ImageFont.load_default()
        
        # 3. Dynamic Vertical Positions
        pos_header = h * 0.15
        pos_recipient = h * 0.32
        pos_footer = h * 0.88
        
        # Header (Occasion)
        draw.text((w/2, pos_header), occasion.upper(), fill=(100, 100, 100), font=font_header, anchor="mm")
        
        # Recipient
        draw.text((w/2, pos_recipient), f"Dear {recipient},", fill=(30, 30, 30), font=font_main, anchor="mm")
        
        # Message with wrapping and centering
        chars_per_line = int(w * 0.04) # Rough estimation for wrapping
        wrapped_message = textwrap.fill(message, width=chars_per_line)
        
        # Calculate text height for vertical centering
        left, top, right, bottom = draw.multiline_textbbox((0, 0), wrapped_message, font=font_message, align="center")
        msg_h = bottom - top
        
        # Center message block in available space
        space_start = pos_recipient + (main_size / 2) + 20
        space_end = pos_footer - 60
        pos_msg = space_start + (space_end - space_start - msg_h) / 2
        
        draw.multiline_text((w/2, pos_msg), wrapped_message, fill=(70, 70, 70), font=font_message, anchor="ma", align="center")
        
        # Sender
        draw.text((w/2, pos_footer), f"Best regards, {sender}", fill=(100, 100, 100), font=font_header, anchor="mm")
        
        # 4. Save
        filename = f"{recipient.replace(' ', '_')}_{occasion.replace(' ', '_')}_{size_name}_{uuid.uuid4().hex[:6]}.png"
        save_path = os.path.join('generated', filename)
        img.save(save_path)
        generated_files.append(filename)
        
    return generated_files
