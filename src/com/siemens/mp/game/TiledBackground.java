/*
 *  Siemens API for MicroEmulator
 *  Copyright (C) 2003 Markus Heberling <markus@heberling.net>
 *
 *  It is licensed under the following two licenses as alternatives:
 *    1. GNU Lesser General Public License (the "LGPL") version 2.1 or any newer version
 *    2. Apache License (the "AL") Version 2.0
 *
 *  You may not use this file except in compliance with at least one of
 *  the above two licenses.
 *
 *  You may obtain a copy of the LGPL at
 *      http://www.gnu.org/licenses/old-licenses/lgpl-2.1.txt
 *
 *  You may obtain a copy of the AL at
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 *  Unless required by applicable law or agreed to in writing, software
 *  distributed under the License is distributed on an "AS IS" BASIS,
 *  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *  See the LGPL or the AL for the specific language governing permissions and
 *  limitations.
 */

package com.siemens.mp.game;

import javax.microedition.lcdui.Graphics;
import javax.microedition.lcdui.Image;

import pl.zb3.freej2me.bridge.graphics.CanvasGraphics;

public class TiledBackground extends GraphicObject {
	private Image[] pixels;
	private byte[] map;
	private int widthInTiles;
	private int heightInTiles;
	private int posx;
	private int posy;

	public TiledBackground(byte[] tilePixels, byte[] tileMask, byte[] map, int widthInTiles, int heightInTiles) {
		this(
				com.siemens.mp.ui.Image.createImageFromBitmap(tilePixels, 8, tilePixels.length),
				com.siemens.mp.ui.Image.createImageFromBitmap(tileMask, 8, tilePixels.length),
				map,
				widthInTiles,
				heightInTiles
		);
	}

	public TiledBackground(ExtendedImage tilePixels, ExtendedImage tileMask, byte[] map, int widthInTiles, int heightInTiles) {
		this(tilePixels.getImage(), tileMask.getImage(), map, widthInTiles, heightInTiles);
	}

	public TiledBackground(Image tilePixels, Image tileMask, byte[] map, int widthInTiles, int heightInTiles) {
		this.map = map;
		this.heightInTiles = heightInTiles;
		this.widthInTiles = widthInTiles;

		pixels = new Image[tilePixels.getHeight() / 8 + 3];
		pixels[0] = Image.createARGBImage(8, 8, 0); // transparent
		pixels[1] = Image.createARGBImage(8, 8, 0xffffffff); // white
		pixels[2] = Image.createARGBImage(8, 8, 0xff000000); // black

		if (tileMask != null) {
			tilePixels = com.siemens.mp.ui.Image.createTransparentImageFromMask(tilePixels, tileMask);
		}

		for (int i = 0; i < this.pixels.length - 3; i++) {
			//Image img = Image.createImage(8, 8, 0);
			//img.getGraphics().drawImage(tilePixels, 0, -i * 8, 0);
			pixels[i + 3] = Image.createImage(tilePixels, 0, i * 8, 8, 8, 0);
		}
	}

	public void setPositionInMap(int x, int y) {
		posx = x;
		posy = y;
	}

	protected void paint(Graphics g, int dx, int dy) {
		// untested, no usable game uses this

		int clientWidth = ((CanvasGraphics)g).getWidth();
		int clientHeight = ((CanvasGraphics)g).getSafeHeight();

		for (int left = dx-(posx % 8), tx = posx/8; left < clientWidth; left+=8,tx++) {
			for (int top = dy-(posy % 8), ty = posy/8; top < clientHeight; top+=8,ty++) {
				g.drawImage(pixels[map[((ty + heightInTiles) % heightInTiles) * widthInTiles + ((tx + widthInTiles)%widthInTiles)] & 0xFF], left, top, 0);
			}
		}
	}

	protected void paint(Graphics g) {
		paint(g, 0, 0);
	}
}