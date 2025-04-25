/*
	This file is part of FreeJ2ME.

	FreeJ2ME is free software: you can redistribute it and/or modify
	it under the terms of the GNU General Public License as published by
	the Free Software Foundation, either version 3 of the License, or
	(at your option) any later version.

	FreeJ2ME is distributed in the hope that it will be useful,
	but WITHOUT ANY WARRANTY; without even the implied warranty of
	MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
	GNU General Public License for more details.

	You should have received a copy of the GNU General Public License
	along with FreeJ2ME.  If not, see http://www.gnu.org/licenses/
*/
package javax.microedition.lcdui;

import javax.microedition.lcdui.Alert;
import javax.microedition.lcdui.Displayable;
import javax.microedition.midlet.MIDlet;

import javax.microedition.lcdui.Image;

import java.util.Vector;
import java.util.Timer;
import java.util.TimerTask;

import java.util.concurrent.locks.ReentrantLock;

import org.recompile.mobile.Mobile;

import pl.zb3.freej2me.bridge.gles2.GLES2;

public class Display
{
	// when fps is limited, this needs to be a fair lock
	// otherwise key events might not get dispatched at proper time
	public static final ReentrantLock LCDUILock = new ReentrantLock(true);

	// this can only be used from a dedicated thread which MAY NOT hold lcduilock
	public static final Object calloutLock = new Object();

	public static final int LIST_ELEMENT = 1;
	public static final int CHOICE_GROUP_ELEMENT = 2;
	public static final int ALERT = 3;
	public static final int COLOR_BACKGROUND = 0;
	public static final int COLOR_FOREGROUND = 1;
	public static final int COLOR_HIGHLIGHTED_BACKGROUND = 2;
	public static final int COLOR_HIGHLIGHTED_FOREGROUND = 3;
	public static final int COLOR_BORDER = 4;
	public static final int COLOR_HIGHLIGHTED_BORDER = 5;


	protected volatile Displayable current;

	private static Display display;

	private boolean insideSetCurrent = false;

	public static boolean usePaintQueue = false;

	public Display()
	{
		display = this;
	}

	public void callSerially(Runnable r)
	{
		Mobile.getPlatform().callSerially(r);
	}

	public boolean flashBacklight(int duration) { return true; }

	public int getBestImageHeight(int imageType)
	{
		switch(imageType)
		{
			case LIST_ELEMENT: return Mobile.getPlatform().lcdHeight / 8;
			case CHOICE_GROUP_ELEMENT: return Mobile.getPlatform().lcdHeight / 8;
			case ALERT: return Mobile.getPlatform().lcdHeight;
		}
		return Mobile.getPlatform().lcdHeight;
	}

	public int getBestImageWidth(int imageType)
	{
		return Mobile.getPlatform().lcdWidth;
	}

	public int getBorderStyle(boolean highlighted) { return 0; }

	public int getColor(int colorSpecifier)
	{
		switch(colorSpecifier)
		{
			case COLOR_BACKGROUND: return 0;
			case COLOR_FOREGROUND: return 0xFFFFFF;
			case COLOR_HIGHLIGHTED_BACKGROUND: return 0xFFFFFF;
			case COLOR_HIGHLIGHTED_FOREGROUND: return 0;
			case COLOR_BORDER: return 0x808080;
			case COLOR_HIGHLIGHTED_BORDER: return 0xFFFFFF;
		}
		return 0;
	}

	public Displayable getCurrent() { return current; }

	public static Display getDisplay(MIDlet m) { return display; }

	public boolean isColor() { return true; }

	public int numAlphaLevels() { return 256; }

	public int numColors() { return 16777216; }

	public void setCurrent(Displayable next)
	{
		if (next == null){
			return;
		}

		LCDUILock.lock();

		try {
			if (current == next || insideSetCurrent)
			{
				return;
			}

			if (next instanceof Alert) {
				((Alert)next).setNextScreen(current);
			}

			try
			{
				insideSetCurrent = true;

				try {
					if (current != null) {
						current.hideNotify();
					}
					Mobile.getPlatform().keyState = 0; // reset keystate
					next.showNotify();
				} finally {
					insideSetCurrent = false;
				}

				current = next;
				current.notifySetCurrent();
				Mobile.getPlatform().flushGraphics(current.platformImage, 0,0, current.width, current.height);
				//System.out.println("Set Current "+current.width+", "+current.height);
			}
			catch (Exception e)
			{
				System.out.println("Problem with setCurrent(next)");
				e.printStackTrace();
			}
		} finally {
			LCDUILock.unlock();
		}
	}

	public void setCurrent(Alert alert, Displayable next)
	{
		try
		{
			setCurrent(alert);
			alert.setNextScreen(next);
		}
		catch (Exception e)
		{
			System.out.println("Problem with setCurrent(alert, next)");
			e.printStackTrace();
		}
	}

	public void setCurrentItem(Item item) {
		Form form = item.getOwner();
		if (form != null) {
			if (form != current) {
				setCurrent(form);
			}
			form.focusItem(item);
		}

	}

	public boolean vibrate(int duration)
	{
		//System.out.println("Vibrate");
		return true;
	}

}
