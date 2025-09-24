#!/usr/bin/env python3
"""
Convert TensorFlow Lite model to TensorFlow.js format
"""

import os
import subprocess
import sys

def convert_tflite_to_tfjs():
    """Convert the TFLite model to TensorFlow.js format"""
    
    # Paths
    tflite_path = "/Users/jatin/trial/assets/models/pose_landmark_full.tflite"
    output_dir = "/Users/jatin/trial/assets/models/pose_model_web/"
    
    # Check if TFLite file exists
    if not os.path.exists(tflite_path):
        print(f"❌ TFLite file not found: {tflite_path}")
        return False
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Install tensorflowjs if not available
    try:
        import tensorflowjs
    except ImportError:
        print("📦 Installing tensorflowjs...")
        subprocess.check_call([sys.executable, "-m", "pip", "install", "tensorflowjs"])
        import tensorflowjs
    
    try:
        # Convert TFLite to TensorFlow.js
        print("🔄 Converting TFLite model to TensorFlow.js format...")
        
        # Use tensorflowjs converter
        cmd = [
            "tensorflowjs_converter",
            "--input_format=tf_lite",
            "--output_format=tfjs_graph_model",
            "--signature_name=serving_default",
            tflite_path,
            output_dir
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True)
        
        if result.returncode == 0:
            print("✅ Model conversion successful!")
            print(f"📁 Converted model saved to: {output_dir}")
            
            # List generated files
            files = os.listdir(output_dir)
            print("📄 Generated files:")
            for file in files:
                print(f"   - {file}")
            
            return True
        else:
            print("❌ Conversion failed:")
            print(result.stderr)
            return False
            
    except Exception as e:
        print(f"❌ Error during conversion: {e}")
        return False

if __name__ == "__main__":
    print("🚀 TensorFlow Lite to TensorFlow.js Converter")
    print("=" * 50)
    
    success = convert_tflite_to_tfjs()
    
    if success:
        print("\n✅ Conversion completed successfully!")
        print("🔧 Next steps:")
        print("1. Update your React Native code to load the converted model")
        print("2. Test the pose detection with real TensorFlow.js model")
    else:
        print("\n❌ Conversion failed. Please check the error messages above.")
