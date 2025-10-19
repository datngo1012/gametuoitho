#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script để tự động generate list.json từ tất cả file JAR trong thư mục
Chạy: python generate-list.py
"""

import os
import json
import re

def get_game_name(filename):
    """Tạo tên game đẹp từ filename"""
    # Bỏ extension
    name = filename.replace('.jar', '').replace('.JAR', '')
    
    # Thay thế _ và - bằng space
    name = name.replace('_', ' ').replace('-', ' ')
    
    # Capitalize các từ
    name = ' '.join(word.capitalize() for word in name.split())
    
    return name

def scan_games():
    """Quét tất cả file JAR trong thư mục"""
    current_dir = os.path.dirname(os.path.abspath(__file__))
    
    # Lấy tất cả file trong thư mục
    all_files = os.listdir(current_dir)
    
    # Filter chỉ file .jar
    jar_files = [f for f in all_files if f.lower().endswith('.jar')]
    
    games_list = []
    
    for jar_file in jar_files:
        base_name = jar_file[:-4]  # Bỏ .jar
        jad_file = base_name + '.jad'
        has_jad = os.path.exists(os.path.join(current_dir, jad_file))
        
        game = {
            "filename": jar_file,
            "name": get_game_name(jar_file),
            "jadFile": jad_file if has_jad else None,
            "icon": None,
            "settings": {
                "phone": "Nokia",
                "width": "240",
                "height": "320",
                "sound": "on"
            }
        }
        
        games_list.append(game)
    
    # Sort theo tên
    games_list.sort(key=lambda x: x['name'])
    
    return games_list

def main():
    """Main function"""
    print("🔍 Đang quét thư mục games/...")
    
    games = scan_games()
    
    if not games:
        print("❌ Không tìm thấy file JAR nào!")
        return
    
    # Ghi vào list.json
    output_path = os.path.join(os.path.dirname(__file__), 'list.json')
    
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(games, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ Đã tạo list.json với {len(games)} games:\n")
    
    for i, game in enumerate(games, 1):
        jad_status = "✓" if game['jadFile'] else "✗"
        print(f"{i:2d}. [{jad_status}] {game['name']:<30} ({game['filename']})")
    
    print(f"\n📝 File đã được lưu: {output_path}")
    print("\n💡 Bạn có thể chỉnh sửa tên game và settings trong list.json")

if __name__ == '__main__':
    main()
