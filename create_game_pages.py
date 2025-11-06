#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate game HTML pages from list.json
"""

import json
import shutil
from pathlib import Path

# Game data with content in both Vietnamese and English
games_data = [
    {
        "id": "worms",
        "filename": "Worms_176x220.jar",
        "name": "Worms",
        "lang": "en",
        "title": "Worms - Classic Turn-Based Strategy Game | Play Online Free",
        "description": "Play Worms - the hilarious turn-based strategy game! Command your worm team with crazy weapons, aim carefully, and blast opponents in physics-based battles. Play now!",
        "keywords": "worms game, turn-based strategy, artillery game, java mobile game, worms online, team worms, strategy game, nokia game",
        "og_title": "Worms - Classic Turn-Based Strategy | Play Free",
        "og_desc": "Command your worm team with crazy weapons! Play Worms, the hilarious turn-based strategy game with physics-based combat.",
        "schema_name": "Worms",
        "schema_alt": "Worms - Turn-Based Strategy",
        "schema_desc": "Worms is a hilarious turn-based strategy game where worm teams use crazy weapons to defeat opponents. Aim carefully, adjust power and angle to blast enemies in physics-based 2D battlegrounds.",
        "schema_genre": '["Strategy", "Turn-based", "Artillery"]',
        "schema_rating": "4.8",
        "schema_reviews": "3200",
        "schema_keywords": "worms, turn-based strategy, artillery game, team battle, physics game, java mobile, retro game",
        "emoji": "🐛",
        "welcome_title": "Worms - Hilarious Turn-Based Warfare!",
        "welcome_desc": "Worms is a legendary turn-based strategy game where teams of worms battle using an arsenal of crazy weapons! Aim carefully, adjust power and angle, then blast your opponents across physics-based 2D battlegrounds in this comedic warfare classic.",
        "features": [
            {"emoji": "💣", "title": "Crazy Weapons", "desc": "Bazookas, grenades, sheep bombs, banana bombs and more ridiculous arsenal!"},
            {"emoji": "🎯", "title": "Strategic Gameplay", "desc": "Master angle, power and timing to outsmart opponents"},
            {"emoji": "🌍", "title": "Destructible Terrain", "desc": "Blow up the landscape and watch worms tumble into the water"},
            {"emoji": "😂", "title": "Hilarious Fun", "desc": "Funny voices, silly animations and entertaining chaos!"}
        ],
        "cta": "💥 Command your worm army to victory!"
    },
    {
        "id": "bounceTales",
        "filename": "BounceTales_240x320.jar",
        "name": "Bounce Tales",
        "lang": "en",
        "title": "Bounce Tales - Nokia Classic Ball Adventure | Play Online Free",
        "description": "Play Bounce Tales - Nokia's beloved classic! Control the red ball through colorful levels, collect stars, and save the world. Nostalgic fun awaits!",
        "keywords": "bounce tales, nokia game, ball game, bounce game, java mobile game, bounce tales online, platform game, retro game",
        "og_title": "Bounce Tales - Nokia Classic Ball Adventure | Play Free",
        "og_desc": "Bounce and roll through colorful adventures! Play Bounce Tales, Nokia's classic ball game online for free.",
        "schema_name": "Bounce Tales",
        "schema_alt": "Bounce Tales - Nokia Classic",
        "schema_desc": "Bounce Tales is Nokia's classic adventure game where you control a red ball bouncing through colorful levels. Roll, jump and bounce over obstacles, collect stars and solve light puzzles to save the world.",
        "schema_genre": '["Adventure", "Platform", "Casual"]',
        "schema_rating": "4.9",
        "schema_reviews": "4500",
        "schema_keywords": "bounce tales, nokia game, ball adventure, platform game, java mobile, retro game",
        "emoji": "🔴",
        "welcome_title": "Bounce Tales - The Red Ball Returns!",
        "welcome_desc": "Bounce Tales is Nokia's iconic platformer! Control the cheerful red ball as it bounces, rolls, and jumps through vibrant worlds. Collect stars, solve simple puzzles, and overcome obstacles in this beloved classic.",
        "features": [
            {"emoji": "🏀", "title": "Bouncing Action", "desc": "Master the bounce mechanic to navigate challenging terrain"},
            {"emoji": "⭐", "title": "Collect Stars", "desc": "Gather all stars for perfect completion in each level"},
            {"emoji": "🌈", "title": "Colorful Worlds", "desc": "Explore beautifully designed levels with vibrant graphics"},
            {"emoji": "🎯", "title": "Light Puzzles", "desc": "Simple but engaging puzzles perfect for all ages"}
        ],
        "cta": "🎮 Start bouncing through adventures now!"
    },
    {
        "id": "princeOfPersia",
        "filename": "PrinceOfPersia_240x320.jar",
        "name": "Prince of Persia Classic",
        "lang": "en",
        "title": "Prince of Persia Classic - Mobile Adventure | Play Online Free",
        "description": "Play Prince of Persia Classic - the legendary action-adventure! Run, jump, sword fight and solve puzzles to save the princess. Experience the classic mobile version!",
        "keywords": "prince of persia, persia classic, action adventure, java mobile game, prince of persia online, platform game, dungeon game",
        "og_title": "Prince of Persia Classic - Action Adventure | Play Free",
        "og_desc": "Navigate dungeons, fight enemies, and save the princess! Play Prince of Persia Classic mobile version online.",
        "schema_name": "Prince of Persia Classic",
        "schema_alt": "Prince of Persia - Classic Mobile",
        "schema_desc": "Prince of Persia Classic is a legendary action-adventure game. Navigate treacherous dungeons, engage in fluid sword combat, solve puzzles within time limits, featuring the series' signature smooth animations.",
        "schema_genre": '["Adventure", "Action", "Puzzle"]',
        "schema_rating": "4.8",
        "schema_reviews": "3800",
        "schema_keywords": "prince of persia, action adventure, platform game, sword fighting, puzzle game, java mobile, retro game",
        "emoji": "⚔️",
        "welcome_title": "Prince of Persia Classic - Save the Princess!",
        "welcome_desc": "Prince of Persia Classic brings the legendary adventure to mobile! Play as the Prince navigating dangerous dungeons, fighting guards with fluid sword combat, and solving environmental puzzles to rescue the princess before time runs out.",
        "features": [
            {"emoji": "🏃", "title": "Parkour Action", "desc": "Run, jump, climb and perform acrobatic moves through dungeons"},
            {"emoji": "⚔️", "title": "Sword Combat", "desc": "Engage in tactical duels with guards using precise timing"},
            {"emoji": "🧩", "title": "Environmental Puzzles", "desc": "Solve traps, switches and platforming challenges"},
            {"emoji": "⏰", "title": "Time Pressure", "desc": "Race against the clock to save the princess!"}
        ],
        "cta": "🏰 Begin your heroic quest now!"
    },
    {
        "id": "assassinsCreedBrotherhood",
        "filename": "assassin-creed-brotherhood-320x240.jar",
        "name": "Assassin's Creed Brotherhood",
        "lang": "en",
        "title": "Assassin's Creed Brotherhood - Mobile Action | Play Online Free",
        "description": "Play Assassin's Creed Brotherhood mobile! Play as Ezio in stealth-action adventures through Rome. Parkour, assassinate and fight Templars online for free!",
        "keywords": "assassins creed, brotherhood, ezio, stealth game, action game, java mobile game, assassins creed online, parkour game",
        "og_title": "Assassin's Creed Brotherhood - Stealth Action | Play Free",
        "og_desc": "Play as Ezio! Master parkour, stealth assassinations and combat in this mobile Assassin's Creed adventure.",
        "schema_name": "Assassin's Creed Brotherhood",
        "schema_alt": "AC Brotherhood - Mobile Edition",
        "schema_desc": "Assassin's Creed Brotherhood mobile brings Ezio's adventure to your device. Master parkour, wall climbing, stealthy assassinations and melee combat in signature stealth-action gameplay set in Renaissance Rome.",
        "schema_genre": '["Action", "Adventure", "Stealth"]',
        "schema_rating": "4.7",
        "schema_reviews": "2900",
        "schema_keywords": "assassins creed, ezio, stealth action, parkour, templars, java mobile, adventure game",
        "emoji": "🗡️",
        "welcome_title": "Assassin's Creed Brotherhood - Ezio's Legacy!",
        "welcome_desc": "Assassin's Creed Brotherhood mobile edition lets you step into Ezio's boots! Experience thrilling parkour across Rome's rooftops, execute stealthy assassinations, and engage in intense combat against the Templar Order.",
        "features": [
            {"emoji": "🏃", "title": "Parkour Movement", "desc": "Free-run across rooftops and scale walls with fluid animations"},
            {"emoji": "🗡️", "title": "Stealth Assassinations", "desc": "Eliminate targets silently from shadows or aerial attacks"},
            {"emoji": "⚔️", "title": "Combat System", "desc": "Engage in sword fights and counter-attacks against guards"},
            {"emoji": "🏛️", "title": "Rome Setting", "desc": "Explore historical Renaissance Rome landmarks"}
        ],
        "cta": "🦅 Nothing is true, everything is permitted!"
    }
]

#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Script to generate game HTML pages from templates
"""

import os
import shutil
from pathlib import Path

# Define the web directory
web_dir = Path(__file__).parent / "web"
template_file = web_dir / "robinsonCrusoeShipwrecked.html"

# Read the template
with open(template_file, 'r', encoding='utf-8') as f:
    template = f.read()

# Game data for all remaining games
games_data = [
    {
        "id": "bounce-tales",
        "filename": "BounceTales_240x320.jar",
        "name": "Bounce Tales",
        "lang": "en",
        "emoji": "🔴",
        "title": "Bounce Tales - Nokia Classic Ball Adventure | Play Online Free",
        "description": "Play Bounce Tales - Nokia's beloved classic! Control the red ball through colorful levels, collect stars, and save the world. Nostalgic fun awaits!",
        "keywords": "bounce tales, nokia game, ball game, bounce game, java mobile game, bounce tales online, platform game, retro game",
        "schema_name": "Bounce Tales",
        "schema_rating": "4.9",
        "schema_reviews": "4500",
        "schema_genre": '["Adventure", "Platform", "Casual"]',
        "welcome_title": "Bounce Tales - The Red Ball Returns!",
        "welcome_desc": "Bounce Tales is Nokia's iconic platformer! Control the cheerful red ball as it bounces, rolls, and jumps through vibrant worlds. Collect stars, solve simple puzzles, and overcome obstacles in this beloved classic.",
        "features": [
            "🏀 <strong>Bouncing Action</strong> - Master the bounce mechanic to navigate challenging terrain",
            "⭐ <strong>Collect Stars</strong> - Gather all stars for perfect completion in each level",
            "🌈 <strong>Colorful Worlds</strong> - Explore beautifully designed levels with vibrant graphics",
            "🎯 <strong>Light Puzzles</strong> - Simple but engaging puzzles perfect for all ages"
        ],
        "cta": "🎮 Start bouncing through adventures now!"
    },
    {
        "id": "prince-of-persia",
        "filename": "PrinceOfPersia_240x320.jar",
        "name": "Prince of Persia Classic",
        "lang": "en",
        "emoji": "⚔️",
        "title": "Prince of Persia Classic - Mobile Adventure | Play Online Free",
        "description": "Play Prince of Persia Classic - the legendary action-adventure! Run, jump, sword fight and solve puzzles to save the princess. Experience the classic!",
        "keywords": "prince of persia, persia classic, action adventure, java mobile game, prince of persia online, platform game, dungeon game",
        "schema_name": "Prince of Persia Classic",
        "schema_rating": "4.8",
        "schema_reviews": "3800",
        "schema_genre": '["Adventure", "Action", "Puzzle"]',
        "welcome_title": "Prince of Persia Classic - Save the Princess!",
        "welcome_desc": "Prince of Persia Classic brings the legendary adventure to mobile! Play as the Prince navigating dangerous dungeons, fighting guards with fluid sword combat, and solving environmental puzzles to rescue the princess before time runs out.",
        "features": [
            "🏃 <strong>Parkour Action</strong> - Run, jump, climb and perform acrobatic moves through dungeons",
            "⚔️ <strong>Sword Combat</strong> - Engage in tactical duels with guards using precise timing",
            "🧩 <strong>Environmental Puzzles</strong> - Solve traps, switches and platforming challenges",
            "⏰ <strong>Time Pressure</strong> - Race against the clock to save the princess!"
        ],
        "cta": "🏰 Begin your heroic quest now!"
    },
    {
        "id": "assassins-creed-brotherhood",
        "filename": "assassin-creed-brotherhood-320x240.jar",
        "name": "Assassin's Creed Brotherhood",
        "lang": "en",
        "emoji": "🗡️",
        "title": "Assassin's Creed Brotherhood - Mobile Action | Play Online Free",
        "description": "Play Assassin's Creed Brotherhood mobile! Play as Ezio in stealth-action adventures through Rome. Parkour, assassinate and fight Templars!",
        "keywords": "assassins creed, brotherhood, ezio, stealth game, action game, java mobile game, assassins creed online, parkour game",
        "schema_name": "Assassin's Creed Brotherhood",
        "schema_rating": "4.7",
        "schema_reviews": "2900",
        "schema_genre": '["Action", "Adventure", "Stealth"]',
        "welcome_title": "Assassin's Creed Brotherhood - Ezio's Legacy!",
        "welcome_desc": "Assassin's Creed Brotherhood mobile edition lets you step into Ezio's boots! Experience thrilling parkour across Rome's rooftops, execute stealthy assassinations, and engage in intense combat against the Templar Order.",
        "features": [
            "🏃 <strong>Parkour Movement</strong> - Free-run across rooftops and scale walls with fluid animations",
            "🗡️ <strong>Stealth Assassinations</strong> - Eliminate targets silently from shadows or aerial attacks",
            "⚔️ <strong>Combat System</strong> - Engage in sword fights and counter-attacks against guards",
            "🏛️ <strong>Rome Setting</strong> - Explore historical Renaissance Rome landmarks"
        ],
        "cta": "🦅 Nothing is true, everything is permitted!"
    },
    {
        "id": "stranded2",
        "filename": "stranded2_xe2uzts5.jar",
        "name": "Stranded 2: Mysteries Of Time",
        "lang": "en",
        "emoji": "⏰",
        "title": "Stranded 2: Mysteries Of Time - Survival Adventure | Play Free",
        "description": "Play Stranded 2: Mysteries Of Time! Time travel survival adventure through ancient civilizations. Craft, build, hunt and explore history!",
        "keywords": "stranded 2, survival game, time travel, ancient civilizations, java mobile game, stranded online, adventure game",
        "schema_name": "Stranded 2: Mysteries Of Time",
        "schema_rating": "4.6",
        "schema_reviews": "2100",
        "schema_genre": '["Survival", "Adventure", "Exploration"]',
        "welcome_title": "Stranded 2: Mysteries Of Time - Travel Through History!",
        "welcome_desc": "Stranded 2: Mysteries Of Time takes survival to a whole new level! Travel through different historical periods, from ancient civilizations to prehistoric times. Gather resources, craft tools, hunt animals, and build shelters while exploring the mysteries of time.",
        "features": [
            "⏰ <strong>Time Travel</strong> - Explore different historical periods and ancient civilizations",
            "🔨 <strong>Advanced Crafting</strong> - Create tools, weapons and structures from era-specific resources",
            "🏛️ <strong>Historical Exploration</strong> - Discover ancient ruins, temples and forgotten civilizations",
            "🎯 <strong>Survival Challenges</strong> - Adapt to each time period's unique dangers and opportunities"
        ],
        "cta": "🌍 Journey through time and survive!"
    },
    {
        "id": "kung-fu-panda",
        "filename": "kungfupand_hwenyazm.jar",
        "name": "Kung Fu Panda",
        "lang": "en",
        "emoji": "🐼",
        "title": "Kung Fu Panda - Martial Arts Action Game | Play Online Free",
        "description": "Play Kung Fu Panda! Become Po the Dragon Warrior in this action-packed martial arts adventure. Master kung fu moves and save the Valley!",
        "keywords": "kung fu panda, po game, martial arts, action game, java mobile game, kung fu panda online, movie game, dreamworks",
        "schema_name": "Kung Fu Panda",
        "schema_rating": "4.7",
        "schema_reviews": "3500",
        "schema_genre": '["Action", "Platform", "Martial Arts"]',
        "welcome_title": "Kung Fu Panda - Become the Dragon Warrior!",
        "welcome_desc": "Kung Fu Panda brings the beloved movie to mobile! Play as Po on his journey to become the Dragon Warrior. Master kung fu techniques, perform spectacular moves, and battle through colorful levels filled with action and humor.",
        "features": [
            "🥋 <strong>Kung Fu Combat</strong> - Execute powerful martial arts moves and combos",
            "🐼 <strong>Play as Po</strong> - Control the lovable panda on his heroic journey",
            "🎬 <strong>Movie-Based Story</strong> - Experience the adventure from the beloved film",
            "🎮 <strong>Special Moves</strong> - Unlock and master Po's signature kung fu techniques"
        ],
        "cta": "🥊 Awesomeness awaits! Start your kung fu journey!"
    },
    {
        "id": "hugo-food-fight",
        "filename": "hugo_foodfight_240x320-236829.jar",
        "name": "Hugo: Food Fight",
        "lang": "en",
        "emoji": "🍔",
        "title": "Hugo: Food Fight - Fun Action Game | Play Online Free",
        "description": "Play Hugo: Food Fight! Join Hugo in a hilarious food battle against witch Scylla. Aim, throw and dodge in this fun arcade action game!",
        "keywords": "hugo game, food fight, hugo troll, action game, java mobile game, hugo online, arcade game, casual game",
        "schema_name": "Hugo: Food Fight",
        "schema_rating": "4.5",
        "schema_reviews": "1800",
        "schema_genre": '["Action", "Casual", "Arcade"]',
        "welcome_title": "Hugo: Food Fight - Epic Food Battle!",
        "welcome_desc": "Hugo: Food Fight is a hilarious action game featuring the beloved troll Hugo! Battle against the evil witch Scylla and her minions using food as ammunition. Aim carefully, time your throws, and dodge incoming food projectiles in this entertaining arcade adventure.",
        "features": [
            "🍕 <strong>Food Ammunition</strong> - Throw pizzas, cakes, pies and more at enemies!",
            "🎯 <strong>Aim & Timing</strong> - Master wind direction and trajectory for perfect hits",
            "😄 <strong>Humorous Gameplay</strong> - Enjoy funny animations and entertaining chaos",
            "🏆 <strong>Progressive Difficulty</strong> - Face increasingly challenging levels"
        ],
        "cta": "🎮 Start the food fight madness!"
    },
    {
        "id": "bobby-carrot",
        "filename": "bobbycarro_w1b7vqyh.jar",
        "name": "Bobby Carrot",
        "lang": "en",
        "emoji": "🐰",
        "title": "Bobby Carrot - Classic Puzzle Game | Play Online Free",
        "description": "Play Bobby Carrot! Guide the clever rabbit through maze puzzles, collect carrots, avoid traps and solve challenges in this classic logic game!",
        "keywords": "bobby carrot, puzzle game, rabbit game, maze game, java mobile game, bobby carrot online, logic game, brain teaser",
        "schema_name": "Bobby Carrot",
        "schema_rating": "4.6",
        "schema_reviews": "2400",
        "schema_genre": '["Puzzle", "Logic", "Strategy"]',
        "welcome_title": "Bobby Carrot - Puzzle Your Way Through Mazes!",
        "welcome_desc": "Bobby Carrot is a beloved puzzle game featuring a clever rabbit on a carrot-collecting quest! Navigate through intricate mazes, avoid deadly traps, push blocks, and use smart logic to collect all carrots and find the exit in each challenging level.",
        "features": [
            "🥕 <strong>Collect Carrots</strong> - Gather all carrots in each maze to proceed",
            "🧩 <strong>Logic Puzzles</strong> - Use strategy to solve increasingly complex challenges",
            "⚠️ <strong>Avoid Traps</strong> - Watch out for enemies, spikes and deadly obstacles",
            "🎯 <strong>Smart Gameplay</strong> - Think ahead and plan your moves carefully"
        ],
        "cta": "🐇 Hop into the puzzle adventure!"
    },
    {
        "id": "thach-sanh",
        "filename": "thachsanh.jar",
        "name": "Thạch Sanh",
        "lang": "vi",
        "emoji": "🗡️",
        "title": "Thạch Sanh - Game Cổ Tích Việt Nam | Chơi Miễn Phí",
        "description": "Chơi game Thạch Sanh! Hóa thân anh hùng dân tộc, diệt yêu trừ quái, cứu công chúa trong truyện cổ tích Việt Nam bất hủ. Chơi ngay!",
        "keywords": "thạch sanh, game cổ tích việt nam, game anh hùng, truyền thuyết việt nam, java mobile game, thạch sanh online, hành động",
        "schema_name": "Thạch Sanh",
        "schema_rating": "4.8",
        "schema_reviews": "3200",
        "schema_genre": '["Hành động", "Phiêu lưu", "Cổ tích Việt Nam"]',
        "welcome_title": "Thạch Sanh - Anh Hùng Dân Tộc!",
        "welcome_desc": "Thạch Sanh là game hành động-phiêu lưu dựa trên truyện cổ tích Việt Nam kinh điển! Hóa thân thành dũng sĩ Thạch Sanh với búa thần và cung tên, chiến đấu với yêu quái, vượt qua thử thách và giải cứu công chúa.",
        "features": [
            "🔨 <strong>Búa Thần</strong> - Sử dụng vũ khí truyền thống để đánh bại quái vật",
            "🏹 <strong>Cung Tên</strong> - Bắn hạ kẻ địch từ xa với kỹ năng thiện xạ",
            "🐉 <strong>Boss Huyền Thoại</strong> - Chiến đấu với đại bàng, xà tinh và các boss đặc sắc",
            "📖 <strong>Cổ Tích Việt Nam</strong> - Trải nghiệm câu chuyện dân gian bất hủ"
        ],
        "cta": "⚔️ Trở thành anh hùng ngay!"
    },
    {
        "id": "nobita-va-truyen-thuyet-nguoi-ca",
        "filename": "S60-TruyenThuyet-NguoiCa-240x320.jar",
        "name": "Nobita và Truyền Thuyết Người Cá",
        "lang": "vi",
        "emoji": "🧜",
        "title": "Nobita và Truyền Thuyết Người Cá - Game Doraemon | Chơi Miễn Phí",
        "description": "Chơi Nobita và Truyền Thuyết Người Cá! Phiêu lưu cùng Doraemon khám phá vương quốc người cá. Thu thập bảo bối, giải đố và vượt thử thách!",
        "keywords": "nobita, doraemon, truyền thuyết người cá, game doraemon, java mobile game, nobita online, phiêu lưu, tuổi thơ",
        "schema_name": "Nobita và Truyền Thuyết Người Cá",
        "schema_rating": "4.7",
        "schema_reviews": "2800",
        "schema_genre": '["Phiêu lưu", "Platform", "Doraemon"]',
        "welcome_title": "Nobita và Truyền Thuyết Người Cá!",
        "welcome_desc": "Nobita và Truyền Thuyết Người Cá mang đến cuộc phiêu lưu kỳ thú dưới đáy đại dương! Cùng Nobita và những người bạn từ túi thần kỳ, khám phá vương quốc người cá bí ẩn, thu thập bảo bối Doraemon và vượt qua thử thách đầy màu sắc.",
        "features": [
            "🎒 <strong>Bảo Bối Doraemon</strong> - Sử dụng các vật phẩm thần kỳ từ túi thần kỳ",
            "🧜 <strong>Vương Quốc Người Cá</strong> - Khám phá thế giới dưới nước kỳ diệu",
            "🎮 <strong>Phiêu Lưu Platform</strong> - Nhảy, tránh chướng ngại và thu thập vật phẩm",
            "👦 <strong>Nhân Vật Quen Thuộc</strong> - Gặp gỡ Nobita, Doraemon và bạn bè"
        ],
        "cta": "🌊 Bắt đầu cuộc phiêu lưu dưới biển!"
    },
    {
        "id": "bo-lac-thoi-tien-su",
        "filename": "Bolacthoitiensu.jar",
        "name": "Bộ Lạc Thời Tiền Sử",
        "lang": "vi",
        "emoji": "🦕",
        "title": "Bộ Lạc Thời Tiền Sử - Game Sinh Tồn Cổ Đại | Chơi Miễn Phí",
        "description": "Chơi Bộ Lạc Thời Tiền Sử! Sinh tồn trong thời nguyên thủy, săn thú dữ, chiến đấu với quái vật và khám phá thế giới hoang dã!",
        "keywords": "bộ lạc tiền sử, game tiền sử, sinh tồn cổ đại, java mobile game, game thời nguyên thủy, hành động, phiêu lưu",
        "schema_name": "Bộ Lạc Thời Tiền Sử",
        "schema_rating": "4.6",
        "schema_reviews": "1900",
        "schema_genre": '["Hành động", "Phiêu lưu", "Sinh tồn"]',
        "welcome_title": "Bộ Lạc Thời Tiền Sử - Sinh Tồn Nguyên Thủy!",
        "welcome_desc": "Bộ Lạc Thời Tiền Sử đưa bạn trở về thời kỳ đồ đá! Hóa thân người tiền sử, săn bắt thú dữ, chiến đấu với quái vật hung dữ, vượt qua rừng rậm, hang động và sa mạc trong cuộc phiêu lưu sinh tồn đầy thử thách.",
        "features": [
            "🏹 <strong>Săn Bắt</strong> - Ném giáo, bắn cung để săn thú và sinh tồn",
            "🦕 <strong>Quái Vật Cổ Đại</strong> - Đối đầu với thú dữ và sinh vật nguy hiểm",
            "🌲 <strong>Thế Giới Nguyên Thủy</strong> - Khám phá rừng, hang động, sa mạc hoang dã",
            "💪 <strong>Sinh Tồn</strong> - Vượt chướng ngại vật và tồn tại trong môi trường khắc nghiệt"
        ],
        "cta": "🔥 Chinh phục thời tiền sử!"
    },
    {
        "id": "con-lon-thien-tinh-su",
        "filename": "con-lon-thien-tinh-su.jar",
        "name": "Côn Lôn Thiên Tình Sứ",
        "lang": "vi",
        "emoji": "🗡️",
        "title": "Côn Lôn Thiên Tình Sứ - Game Tiên Hiệp | Chơi Miễn Phí",
        "description": "Chơi Côn Lôn Thiên Tình Sứ! ARPG tiên hiệp huyền ảo, tu tiên, diệt yêu trừ ma, viết nên mối tình ngàn năm. Hành động võ thuật đỉnh cao!",
        "keywords": "côn lôn, tiên hiệp, tu tiên, game kiếm hiệp, arpg, java mobile game, võ thuật, huyền ảo, tình cảm",
        "schema_name": "Côn Lôn Thiên Tình Sứ",
        "schema_rating": "4.7",
        "schema_reviews": "2600",
        "schema_genre": '["ARPG", "Tiên hiệp", "Võ thuật"]',
        "welcome_title": "Côn Lôn Thiên Tình Sứ - Tu Tiên Diệt Ma!",
        "welcome_desc": "Côn Lôn Thiên Tình Sứ là ARPG tiên hiệp đỉnh cao! Hóa thân đệ tử tu tiên, rèn luyện pháp thuật, diệt yêu trừ ma và viết nên câu chuyện tình yêu ngàn năm đầy cảm động trong thế giới huyền ảo Côn Lôn.",
        "features": [
            "⚡ <strong>Pháp Thuật</strong> - Tung chiêu thức tiên hiệp oai hùng và đẹp mắt",
            "🗡️ <strong>Tu Tiên</strong> - Nâng cấp nhân vật, học kỹ năng mới và tăng cường sức mạnh",
            "👹 <strong>Diệt Yêu Trừ Ma</strong> - Chiến đấu với boss yêu quái và ma đầu hung ác",
            "💕 <strong>Cốt Truyện Tình Cảm</strong> - Trải nghiệm câu chuyện tình yêu bi tráng"
        ],
        "cta": "✨ Bước vào thế giới tu tiên!"
    }
]

def create_game_page(game):
    """Create a game page from template"""
    output_file = web_dir / f"{game['id']}.html"
    
    # Read template
    content = template
    
    # Replace meta tags
    content = content.replace(
        '<html lang="en">',
        f'<html lang="{game["lang"]}">'
    )
    
    content = content.replace(
        '<title>Robinson Crusoe: Shipwrecked - Survival Adventure Game | Play Free</title>',
        f'<title>{game["title"]}</title>'
    )
    
    content = content.replace(
        'content="Play Robinson Crusoe: Shipwrecked - the ultimate survival adventure game! Explore islands, craft tools, build shelter, and survive on a deserted island. Play now!"',
        f'content="{game["description"]}"'
    )
    
    content = content.replace(
        'content="robinson crusoe game, shipwrecked, survival game, adventure game, island game, java mobile game, robinson crusoe online, nokia game"',
        f'content="{game["keywords"]}"'
    )
    
    # Replace Open Graph
    content = content.replace(
        'robinsonCrusoeShipwrecked.html',
        f'{game["id"]}.html'
    )
    
    content = content.replace(
        'robinson_crusoe_shipwrecked_240x320.jar',
        game['filename']
    )
    
    # Replace Schema.org
    content = content.replace(
        '"name": "Robinson Crusoe: Shipwrecked"',
        f'"name": "{game["schema_name"]}"'
    )
    
    content = content.replace(
        '"ratingValue": "4.7"',
        f'"ratingValue": "{game["schema_rating"]}"'
    )
    
    content = content.replace(
        '"reviewCount": "2200"',
        f'"reviewCount": "{game["schema_reviews"]}"'
    )
    
    content = content.replace(
        '"genre": ["Adventure", "Survival", "Strategy"]',
        f'"genre": {game["schema_genre"]}'
    )
    
    # Replace breadcrumb and header
    content = content.replace(
        '<span style="color: var(--text-primary); font-weight: 600;">🏝️ Robinson Crusoe: Shipwrecked</span>',
        f'<span style="color: var(--text-primary); font-weight: 600;">{game["emoji"]} {game["name"]}</span>'
    )
    
    content = content.replace(
        '<h1>Robinson Crusoe: Shipwrecked</h1>',
        f'<h1>{game["name"]}</h1>'
    )
    
    # Replace welcome section
    content = content.replace(
        '<h2 style="font-size: 2em; margin-bottom: 20px;">🏝️ Robinson Crusoe: Shipwrecked - Survive the Island!</h2>',
        f'<h2 style="font-size: 2em; margin-bottom: 20px;">{game["emoji"]} {game["welcome_title"]}</h2>'
    )
    
    # Build features list
    features_html = '\n'.join([f'          <li>{feature}</li>' for feature in game['features']])
    
    # Replace content block
    old_content = '''<p><strong>Robinson Crusoe: Shipwrecked</strong> is an epic survival adventure game where you're stranded on a deserted island! Explore vast territories, craft essential tools, build shelter, hunt for food, and uncover the island's mysterious secrets.</p>
        
        <p><strong>✨ Why Play Robinson Crusoe:</strong></p>
        <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
          <li>🏝️ <strong>Island Exploration</strong> - Discover hidden caves, beaches, forests, and mysterious locations</li>
          <li>🔨 <strong>Crafting System</strong> - Create tools, weapons, and items from natural resources</li>  
          <li>🏠 <strong>Build & Survive</strong> - Construct shelter, make fire, and protect yourself from dangers</li>
          <li>🎯 <strong>Adventure Quests</strong> - Complete missions and uncover the island's secrets</li>
        </ul>
        
        <p style="font-size: 1.1em; font-weight: 600; margin-top: 20px;">🌊 Start your island survival adventure now!</p>'''
    
    new_content = f'''<p><strong>{game["name"]}</strong> {game["welcome_desc"]}</p>
        
        <p><strong>✨ Why Play {game["name"]}:</strong></p>
        <ul style="text-align: left; max-width: 600px; margin: 0 auto;">
{features_html}
        </ul>
        
        <p style="font-size: 1.1em; font-weight: 600; margin-top: 20px;">{game["cta"]}</p>'''
    
    content = content.replace(old_content, new_content)
    
    # Replace loading text
    content = content.replace(
        '<h2>🏝️ Play Robinson Crusoe: Shipwrecked Now</h2>',
        f'<h2>{game["emoji"]} Play {game["name"]} Now</h2>'
    )
    
    content = content.replace(
        '<div class="loading-text">Loading Robinson Crusoe: Shipwrecked...</div>',
        f'<div class="loading-text">Loading {game["name"]}...</div>'
    )
    
    content = content.replace(
        '⏳ Starting Java environment to run Robinson Crusoe: Shipwrecked.<br>',
        f'⏳ Starting Java environment to run {game["name"]}.<br>'
    )
    
    # Replace footer
    content = content.replace(
        '<h3>🏝️ Robinson Crusoe: Shipwrecked Online</h3>',
        f'<h3>{game["emoji"]} {game["name"]} Online</h3>'
    )
    
    content = content.replace(
        '<p>Play Robinson Crusoe: Shipwrecked - the ultimate survival adventure! Explore islands, craft tools, build shelter, and survive. Play online for free!</p>',
        f'<p>Play {game["name"]} - {game["description"].split("!")[1] if "!" in game["description"] else game["description"]} Play online for free!</p>'
    )
    
    content = content.replace(
        '<li><a href="#faq" onclick="showPolicy(\'faq\'); return false;">❓ How to Play Robinson Crusoe</a></li>',
        f'<li><a href="#faq" onclick="showPolicy(\'faq\'); return false;">❓ How to Play {game["name"]}</a></li>'
    )
    
    content = content.replace(
        '<p>© 2025 Game Tuổi Thơ. Made with <span class="footer-heart">❤️</span> for Robinson Crusoe fans.</p>',
        f'<p>© 2025 Game Tuổi Thơ. Made with <span class="footer-heart">❤️</span> for {game["name"]} fans.</p>'
    )
    
    content = content.replace(
        '<p>Robinson Crusoe: Shipwrecked is a classic Java Mobile game. We provide a free online platform to play.</p>',
        f'<p>{game["name"]} is a classic Java Mobile game. We provide a free online platform to play.</p>'
    )
    
    # Write file
    with open(output_file, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ Created: {output_file.name}")

# Main execution
if __name__ == "__main__":
    print("🎮 Game Page Generator")
    print("=" * 50)
    print(f"Template: {template_file.name}")
    print(f"Output directory: {web_dir}")
    print(f"Games to create: {len(games_data)}")
    print("=" * 50)
    print()
    
    for game in games_data:
        try:
            create_game_page(game)
        except Exception as e:
            print(f"❌ Error creating {game['id']}: {e}")
    
    print()
    print("=" * 50)
    print(f"✨ Complete! Created {len(games_data)} game pages")
    print("=" * 50)

