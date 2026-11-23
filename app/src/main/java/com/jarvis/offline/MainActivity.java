package com.jarvis.offline;

import android.app.Activity;
import android.os.Bundle;
import android.os.Build;
import android.Manifest;
import android.content.pm.PackageManager;
import android.content.Intent;
import android.speech.RecognizerIntent;
import android.speech.SpeechRecognizer;
import android.speech.RecognitionListener;
import android.view.View;
import android.view.Gravity;
import android.widget.*;
import android.graphics.Color;
import android.graphics.Typeface;
import android.graphics.drawable.GradientDrawable;
import java.net.DatagramPacket;
import java.net.DatagramSocket;
import java.net.InetAddress;
import java.util.ArrayList;
import java.util.Locale;

public class MainActivity extends Activity {
    private EditText ipField, tokenField;
    private TextView status, heard;
    private SpeechRecognizer recognizer;
    private static final int REQ_AUDIO = 41;
    private final int cyan = Color.rgb(53,214,255);

    @Override public void onCreate(Bundle b) {
        super.onCreate(b);
        buildUi();
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED)
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO}, REQ_AUDIO);
    }
    private GradientDrawable bg(int color, int stroke) {
        GradientDrawable d = new GradientDrawable(); d.setColor(color); d.setCornerRadius(18);
        if (stroke != 0) d.setStroke(1, stroke);
        return d;
    }
    private TextView text(String s, int size, int color) {
        TextView t = new TextView(this); t.setText(s); t.setTextColor(color); t.setTextSize(size);
        t.setTypeface(Typeface.DEFAULT, Typeface.BOLD); return t;
    }
    private void space(LinearLayout l, int h) { l.addView(new View(this), new LinearLayout.LayoutParams(1,h)); }
    private void styleInput(EditText e) {
        e.setTextColor(Color.WHITE); e.setHintTextColor(Color.GRAY); e.setSingleLine(true);
        e.setPadding(14,12,14,12); e.setBackground(bg(Color.rgb(12,25,38),Color.rgb(35,65,85)));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1,-2); p.bottomMargin=10; e.setLayoutParams(p);
    }
    private Button button(String s) {
        Button b = new Button(this); b.setText(s); b.setTextColor(Color.rgb(5,11,22)); b.setTextSize(14);
        b.setTypeface(Typeface.DEFAULT,Typeface.BOLD); b.setBackground(bg(cyan,0));
        LinearLayout.LayoutParams p = new LinearLayout.LayoutParams(-1,-2); p.bottomMargin=9; b.setLayoutParams(p); return b;
    }
    private void buildUi() {
        ScrollView scroll = new ScrollView(this); scroll.setFillViewport(true);
        LinearLayout root = new LinearLayout(this); root.setOrientation(1); root.setPadding(22,30,22,24);
        root.setBackgroundColor(Color.rgb(5,11,22)); scroll.addView(root);
        TextView logo = text("J.A.R.V.I.S",30,cyan); logo.setGravity(Gravity.CENTER); root.addView(logo);
        TextView sub = text("OFFLINE VOICE CONTROL  •  ESP8266",11,Color.LTGRAY); sub.setGravity(Gravity.CENTER); root.addView(sub);
        space(root,22);
        status = text("● READY | Configure NodeMCU connection",14,Color.rgb(120,235,170));
        status.setPadding(14,16,14,16); status.setBackground(bg(Color.rgb(12,25,38),cyan)); root.addView(status);
        space(root,18); root.addView(text("NODEMCU NETWORK",14,cyan));
        ipField = new EditText(this); ipField.setSingleLine(true); ipField.setText("192.168.43.255");
        ipField.setHint("Broadcast IP, e.g. 192.168.43.255"); styleInput(ipField); root.addView(ipField);
        tokenField = new EditText(this); tokenField.setSingleLine(true);
        tokenField.setHint("COMMAND_TOKEN from firmware"); tokenField.setInputType(0x00000081);
        styleInput(tokenField); root.addView(tokenField);
        space(root,14);
        Button listen = button("SPEAK A COMMAND"); root.addView(listen); listen.setOnClickListener(v -> listenOnce());
        Button on = button("LIGHT ON"); root.addView(on); on.setOnClickListener(v -> send("LIGHT_ON"));
        Button off = button("LIGHT OFF"); root.addView(off); off.setOnClickListener(v -> send("LIGHT_OFF"));
        space(root,14); root.addView(text("VOICE INPUT",13,cyan));
        heard = text("Say: Jarvis light on / Jarvis light off\nHindi: light chalu karo / light band karo",14,Color.WHITE);
        heard.setPadding(14,16,14,16); heard.setBackground(bg(Color.rgb(12,25,38),Color.rgb(35,65,85))); root.addView(heard);
        space(root,14);
        TextView note = new TextView(this);
        note.setText("PRESS-TO-TALK • UDP PORT 4210\nAndroid 11: offline speech requires an offline language pack in the phone's recognition service.\nAndroid 2.3: manual controls only are intended; voice is not guaranteed.\n\nUDP send does not confirm NodeMCU receipt. Keep the hotspot private and use a long random token.");
        note.setTextColor(Color.LTGRAY); note.setTextSize(12); root.addView(note);
        setContentView(scroll);
    }
    private void listenOnce() {
        if (!SpeechRecognizer.isRecognitionAvailable(this)) { status.setText("VOICE SERVICE UNAVAILABLE. Use manual controls."); return; }
        if (Build.VERSION.SDK_INT >= 23 && checkSelfPermission(Manifest.permission.RECORD_AUDIO) != PackageManager.PERMISSION_GRANTED) {
            requestPermissions(new String[]{Manifest.permission.RECORD_AUDIO},REQ_AUDIO); return;
        }
        try {
            if (recognizer != null) recognizer.destroy();
            recognizer = SpeechRecognizer.createSpeechRecognizer(this);
            recognizer.setRecognitionListener(new RecognitionListener() {
                public void onReadyForSpeech(Bundle p){ status.setText("● LISTENING..."); }
                public void onBeginningOfSpeech(){} public void onRmsChanged(float r){}
                public void onBufferReceived(byte[] b){} public void onEndOfSpeech(){ status.setText("Processing speech..."); }
                public void onError(int e){ status.setText("Voice error "+e+". Try again or use buttons."); }
                public void onResults(Bundle b){ ArrayList<String> a=b.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION); if(a!=null&&!a.isEmpty()) handlePhrase(a.get(0)); }
                public void onPartialResults(Bundle b){} public void onEvent(int t,Bundle p){}
            });
            Intent i = new Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL,RecognizerIntent.LANGUAGE_MODEL_FREE_FORM);
            i.putExtra(RecognizerIntent.EXTRA_LANGUAGE,Locale.getDefault().toString());
            if (Build.VERSION.SDK_INT >= 23) i.putExtra(RecognizerIntent.EXTRA_PREFER_OFFLINE,true);
            i.putExtra(RecognizerIntent.EXTRA_PROMPT,"Say light on or light off"); recognizer.startListening(i);
        } catch(Exception ex) { status.setText("Cannot start voice: "+ex.getMessage()); }
    }
    private void handlePhrase(String phrase) {
        String s=phrase.toLowerCase(Locale.US); heard.setText("Heard: "+phrase);
        if (s.contains("light on") || s.contains("lights on") || s.contains("chalu") || s.contains("चालू") || s.contains("jalao") || s.contains("जला")) send("LIGHT_ON");
        else if (s.contains("light off") || s.contains("lights off") || s.contains("band") || s.contains("बंद") || s.contains("bujhao")) send("LIGHT_OFF");
        else status.setText("Command not recognized. Try light on/off.");
    }
    private void send(final String command) {
        final String host=ipField.getText().toString().trim(), token=tokenField.getText().toString().trim();
        if(host.isEmpty() || token.isEmpty()){ status.setText("Enter broadcast IP and firmware command token."); return; }
        status.setText("Sending "+command+"...");
        new Thread(() -> {
            String result;
            try {
                byte[] data=(token+"|"+command).getBytes("UTF-8"); DatagramSocket socket=new DatagramSocket();
                socket.setBroadcast(true); DatagramPacket packet=new DatagramPacket(data,data.length,InetAddress.getByName(host),4210);
                socket.send(packet); socket.close(); result="Sent "+command+" via UDP. No acknowledgement received.";
            } catch(Exception e) { result="Send failed: "+e.getMessage(); }
            final String r=result; runOnUiThread(() -> status.setText(r));
        }).start();
    }
    @Override protected void onDestroy() {
        if(recognizer!=null){recognizer.destroy();recognizer=null;}
        super.onDestroy();
    }
}
