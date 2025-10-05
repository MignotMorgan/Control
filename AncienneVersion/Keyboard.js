
var Modifiers = { Shift:false, Ctrl:false, Alt:false, Meta:false, Capslock:false, Keycode:0, Value:"", Shortcut:"" };
var CopyText = "";
// à faire !!!!!!
//this.CanWrite : verifier avec une expression reguliere this.RegularExpression = "";
// Cut et Copy
// Selection du texte avec la souris et Maj
// retour à la ligne, et caractère d'échappement
// UpArrow && DownArrow avec width et non plus nbr caractère.
// Texte Souligné, Barré, ect....
// retour à la ligne automatique par mot!!!
// this.PositionToLine = function(nbr)//changer en tenant compte de Width!!!!!!!!!!!!!MMM iii Shortcut

function FindKeyboard( shift, ctrl, alt, meta, keycode)
{
    for(var i = 0; i < PageInfo.Keyboard.length; i++)
    {
        if (keycode != PageInfo.Keyboard[i].KeyCode)continue;
        if (shift && !PageInfo.Keyboard[i].Shift)continue;
        if (ctrl && !PageInfo.Keyboard[i].Ctrl)continue;
        if (alt && !PageInfo.Keyboard[i].Alt)continue;
        if (meta && !PageInfo.Keyboard[i].Meta)continue;
        return PageInfo.Keyboard[i].Value;
    }
    return "";
};
function FindShortcut( shift, ctrl, alt, meta, keycode)
{
    for(var i = 0; i < PageInfo.MapInfo.Shortcut.length; i++)
    {
        if (keycode != PageInfo.MapInfo.Shortcut[i].KeyCode)continue;
        if (shift && !PageInfo.MapInfo.Shortcut[i].Shift)continue;
        if (ctrl && !PageInfo.MapInfo.Shortcut[i].Ctrl)continue;
        if (alt && !PageInfo.MapInfo.Shortcut[i].Alt)continue;
        if (meta && !PageInfo.MapInfo.Shortcut[i].Meta)continue;
        return PageInfo.MapInfo.Shortcut[i].Value;
    }
    return "";
};

function OnKeyDown_Keyboard(e)
{
    Modifiers.Shift = e.shiftKey;
    Modifiers.Ctrl = e.ctrlKey;
	Modifiers.Alt = e.altKey;
	Modifiers.Meta = e.metaKey;

    Modifiers.Keycode = e.keyCode ? e.keyCode : e.which;
	if(Modifiers.Keycode == 20)Modifiers.Capslock = !Modifiers.Capslock;
    Modifiers.Value = FindKeyboard(Modifiers.Capslock?!e.shiftKey:e.shiftKey,e.ctrlKey,e.altKey,e.metaKey,Modifiers.Keycode);
    Modifiers.Shortcut = FindShortcut(Modifiers.Capslock?!e.shiftKey:e.shiftKey,e.ctrlKey,e.altKey,e.metaKey,Modifiers.Keycode);
    
	if ( Focus != null )
        Focus.OnKeyDown();
        
    return false;
};

function OnKeyUp_Keyboard(e)
{
    Modifiers.Shift = e.shiftKey;
    Modifiers.Ctrl = e.ctrlKey;
	Modifiers.Alt = e.altKey;
	Modifiers.Meta = e.metaKey;

    return false;
};

function TextBox(x, y, width, height, border)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, border);
    delete this.InheritClass;
    this.Inherit("TextBox");
   
    this.AppearanceType = "TextBox"; 
    
//    this.BackColor = "white";
//    this.Border = {Left:5, Top:0, Right:0, Bottom:0 };
    
    this.BackText = "";
    this.SpecialChar = "";
    this.Text = "";
    this.MaxLength = 2000;
    this.Numeric = false;
    this.ReadOnly = false;
    
    this.ScrollBar = 0;
////////    this.MaxLine = 1;
//    this.Font = PageInfo.Font_TextBox;
//    this.FontHeight = 15;
//    this.Font = Appearance.TextBox.Font;
//    Appearance.TextBox.FontHeight = 15;
    this.MaxLine = Math.floor( (this.Rectangle.Height-this.Border.Top-this.Border.Bottom)/Appearance.TextBox.FontHeight );
    this.Lines = new Array("");
    
    this.Start = 0;
    this.Position = 0;
    this.PositionLast = -1;
    this.ClickLast = false;
    this.DrawLast = false;  
    this.GetLast = function()
    {
        if(this.PositionLast > this.Position)
            return this.Text.substr(this.Position, this.PositionLast-this.Position);
        else
            return this.Text.substr(this.PositionLast, this.Position-this.PositionLast);
    };
    
    this.MultiLine = false;
    
    this.SetText = function(text){if(text == null || text == undefined)text = ""; this.Clear(); this.Text = text; this.Modified(); this.PositionChanged(); this.TextChanged(); };
    this.GetText = function(){ return this.Text; };
    this.TextChanged = function(){};
    
    this.OnFocus = function()
    {
        if( this.CanFocus && !this.ReadOnly ){ Focus = this; this.FirstPosition(null); }
        else if ( this.Parent != null ) this.Parent.OnFocus();
    };
    this.FormChanged = function()
    {
        this.Form = this.Parent.Form;
        this.Modified(); this.PositionChanged();// this.TextChanged();   
        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].FormChanged();
    };
    this.MouseMove = function ()
    {
        if(this.ClickLast)
        {
            var width = Mouse.X - this.Form.Position.X - this.Rectangle.X - this.Border.Left;
            var line = this.ScrollBar + Math.floor( (Mouse.Y - this.Form.Position.Y - this.Rectangle.Y - this.Border.Top)/Appearance.TextBox.FontHeight );
            this.Position = this.FindPosition(line, width);
            this.DrawLast = true;
        }
    };
    this.ClickLeft = function()
    {
        if(this.Parent != null && this.ReadOnly) this.Parent.ClickLeft();
        if( this.Form == null )this.Form = this.FindForm();
        this.SpecialChar = "";
        var width = Mouse.X - this.Form.Position.X - this.Rectangle.X - this.Border.Left;
        var line = this.ScrollBar + Math.floor( (Mouse.Y - this.Form.Position.Y - this.Rectangle.Y - this.Border.Top)/Appearance.TextBox.FontHeight );
        this.Position = this.FindPosition(line, width);
        this.PositionLast = this.Position;
        this.ClickLast = true;
        this.DrawLast = false;
    };
    this.ClickLeftUp = function(){ this.ClickLast = false; };
    this.ClickRight = function(){};
    this.ClickRightUp = function(){};

    this.TextKeyDown = this.OnKeyDown;
    this.OnKeyDown = function()
    {
        if(this.Parent != null && this.ReadOnly){ this.Parent.OnKeyDown(); return; }
	    if ( Modifiers.Value == "^" && this.SpecialChar == "" )this.SpecialChar = "^";
	    else if ( Modifiers.Value == "¨" && this.SpecialChar == "" )this.SpecialChar = "¨";
	    else if ( Modifiers.Value == "~" && this.SpecialChar == "" )this.SpecialChar = "~";
	    else if ( this.CanWrite(Modifiers.Value) )
        {
            if ( this.MaxLength != undefined && this.Text.length >= this.MaxLength )return;
            if (this.SpecialChar != "")
            {
                var specialchar = undefined;
                if (this.SpecialChar == "^")specialchar = Circumflex[Modifiers.Value];
                else if (this.SpecialChar == "¨")specialchar = Diaeresis[Modifiers.Value];
                else if (this.SpecialChar == "~")specialchar = Tilde[Modifiers.Value];
                
                if (specialchar == undefined)
                {
                    Modifiers.Value = this.SpecialChar + Modifiers.Value;
                    ++this.Position;
                }
                else Modifiers.Value = specialchar;
                this.SpecialChar = "";
            }
            var tempText1 = this.Text.substr(0, this.Position);
            var tempText2 = this.Text.substr(this.Position, this.Text.length);     
            this.Text = tempText1 + Modifiers.Value + tempText2;
            ++this.Position;
            this.Modified();
            this.TextChanged();
            this.PositionChanged();
        }
        else
	    {
	        this.TextKeyDown();
	    }
    };
    this.KeyDown = function()
    {
        switch(Modifiers.Value)
        {
            case "Copy" :
                this.KeyCopy();
                break;
            case "Paste" :
                this.KeyPaste();
                break;
        }   
    }
    
//    this.OnKeyDown = FunctionKeyDown;
//    this.Action = FunctionAction;
    this.KeyEnter = function()
    {
        if(this.MultiLine && this.ReadOnly == false)
        {
            var tempText1 = this.Text.substr(0, this.Position);
            var tempText2 = this.Text.substr(this.Position, this.Text.length);     
            this.Text = tempText1 + "\u000A" + tempText2;
            ++this.Position;
            this.Modified();
            this.TextChanged();
            this.PositionChanged();
        }
    };
    this.KeyEsc = function(){ Focus = null; this.SpecialChar = ""; };
    this.KeyLeftArrow = function(){ if( this.Position > 0 ){ --this.Position; this.PositionChanged(); } };
    this.KeyRightArrow = function(){ if( this.Position < this.Text.length ){ ++this.Position; this.PositionChanged(); } };
    this.KeyUpArrow = function(){ if( this.MultiLine ){ this.PositionToLine(-1); this.PositionChanged(); } };
    this.KeyDownArrow = function(){ if( this.MultiLine ) { this.PositionToLine(1); this.PositionChanged(); } };
    this.KeySpace = function()
    {
        var tempText1 = this.Text.substring(0,this.Position);
        var tempText2 = this.Text.substring(this.Position,this.Text.length);        
        this.Text = tempText1 + " " + tempText2;
        ++this.Position;
        this.Modified();
        this.TextChanged();
        this.PositionChanged();
    };
    this.KeyBackspace = function()
    {
        if( this.Position > 0 )
        {
            var tempText1 = this.Text.substr(0,this.Position-1);
            var tempText2 = this.Text.substr(this.Position,this.Text.length);
            this.Text = tempText1 + tempText2;
            --this.Position;
            this.Modified();
            this.TextChanged();
        }
    };
    this.KeyDelete = function()
    {
        if( this.Position < this.Text.length )
        {
            var tempText1 = this.Text.substr(0,this.Position);
            var tempText2 = this.Text.substr(this.Position+1,this.Text.length);
            this.Text = tempText1 + tempText2;
            this.Modified();
            this.TextChanged();
        }
    };
    this.KeyCopy = function()
    {
        CopyText = this.GetLast();
        if(CopyText == "")
        {
            var linestart = 0;
            for( var l = 0; l < this.Lines.length; l++)
            {
                if( linestart <= this.Position && this.Position <= linestart + this.Lines[l].length)
                    CopyText = this.Lines[l];
                linestart += this.Lines[l].length;
            }
        }
    };
    this.KeyPaste = function()
    {
        var tempText1 = this.Text.substring(0,this.Position);
        var tempText2 = this.Text.substring(this.Position,this.Text.length);        
        this.Text = tempText1 + CopyText + tempText2;
        this.Position += CopyText.length;
        this.Modified();
        this.TextChanged();
        this.PositionChanged();
    };

    this.OnMouseWheel = function(rolled)
    {
        if(this.Parent != null && this.ReadOnly)
        {
            this.Parent.OnMouseWheel(rolled); 
        }
        else if( this.MultiLine )
        {
            if(rolled < 0) this.PositionToLine(-1);
            else this.PositionToLine(1);
            this.PositionChanged(); 
        }
        else
        {
            if(rolled < 0 && this.Position > 0){ --this.Position; this.PositionChanged(); }
            else if(rolled > 0 && this.Position < this.Text.length){ ++this.Position; this.PositionChanged(); }
        }
    };

    this.CanWrite = function(txt)
    {
//        if( Modifiers.Value == "") return false;
//        if( Modifiers.Value.length > 1) return false;
        if( txt == "" || txt.length > 1) return false;
        if( this.Numeric && this.Text == "0"){ this.Clear(); this.Text = ""; };
        if( this.Numeric && isNaN( this.Text.substr(0, this.Position) + txt + this.Text.substr(this.Position, this.Text.length) ) )return false;
        return true;
    }
//    this.RectangleChanged = function()
//    this.Resized = function()
    this.TextResize = this.ResizeTo;
    this.ResizeTo = function(width, height)
    {
//        if( width < this.Border.Left + this.Border.Right + Appearance.TextBox.FontHeight )width = this.Border.Left + this.Border.Right + Appearance.TextBox.FontHeight;
//        if( height < this.Border.Top + this.Border.Bottom + Appearance.TextBox.FontHeight )height = this.Border.Top + this.Border.Bottom + Appearance.TextBox.FontHeight;
//        if( this.Rectangle.Width < this.Border.Left + this.Border.Right + Appearance.TextBox.FontHeight )return;
//        if( this.Rectangle.Height < this.Border.Top + this.Border.Bottom + Appearance.TextBox.FontHeight )return;
        
        this.TextResize(width, height);
        
        this.MaxLine = Math.floor( (this.Rectangle.Height - this.Border.Top - this.Border.Bottom)/Appearance.TextBox.FontHeight );
        
        if(this.MaxLine == 0)this.MaxLine = 1;
        
        this.Start = 0;
        this.ScrollBar = 0;
        this.Modified();
        this.PositionChanged();
        
//        if( this.Controls != null )
//            for(var i = 0; i < this.Controls.length; i++)
//                this.Controls[i].ParentRectangleChanged();
//                this.Controls[i].ParentRectangleChanged();

//alert(this.Lines.length);
    };
    this.TextScale = this.ScaleTo;
    this.ScaleTo = function(ratio_width, ratio_height)
    {
        this.TextScale(ratio_width, ratio_height);

        this.MaxLine = Math.floor( (this.Rectangle.Height - this.Border.Top - this.Border.Bottom)/Appearance.TextBox.FontHeight );
        
        if(this.MaxLine == 0)this.MaxLine = 1;
        
        this.Start = 0;
        this.ScrollBar = 0;
        this.Modified();
        this.PositionChanged();
    };
    
//    this.MinText = this.MinimumSize;
//    this.MinimumSize = function()
//    {
//        var size = this.MinText();
//        if(size.Width < Appearance.TextBox.FontHeight+this.Border.Left+this.Border.Right)size.Width = Appearance.TextBox.FontHeight+this.Border.Left+this.Border.Right;
//        if(size.Height < Appearance.TextBox.FontHeight+this.Border.Top+this.Border.Bottom)size.Height = Appearance.TextBox.FontHeight+this.Border.Top+this.Border.Bottom;
////        alert(size.Width +" : "+ size.Height);
//        return size;
//    };
    this.FindPosition = function(line, width)
    {
        if( this.Form == null )
        {
            this.Form = this.FindForm();
            if(this.Form != null)
                this.Context = this.Form.Context;
        }
        var font_default = this.Context.font;
        this.Context.font = Appearance.TextBox.Font;
                 
        if ( line >= this.Lines.length )
            line = this.Lines.length-1;

        var position = 0;
        var linestart = 0;
        if( !this.MultiLine ) linestart = this.Start;
        for(var l = 0; l < this.Lines.length; l++)
        {
            if( l < line )
                linestart += this.Lines[l].length;
            else if ( l == line )
            {
                var tempText;
                for(var i = 0; i <= this.Lines[l].length; i++)
                {
                    tempText = this.Lines[l].substring(0, i);
                    if (this.Context.measureText(tempText).width <= width)
                        position = linestart + i;
                }
            }
            else
                break;
        }
        this.Context.font = font_default;
        return position;  
    };
    this.PositionChanged = function()
    {
        if( this.MultiLine )
        {
            var lineposition = this.FindLine();
            
            if( lineposition < this.ScrollBar )
            {
                this.ScrollBar = lineposition;
            }
            if( lineposition >= this.ScrollBar + this.MaxLine )
            {
                this.ScrollBar = lineposition - this.MaxLine +1;
            }
        }
        else
        {
            if( this.Start > this.Position )
            {
                this.Start = this.Position;
                this.Modified();
            }
            if( this.Lines[0].length < this.Position - this.Start )
            {
                this.Start = this.Position - this.Lines[0].length;
                this.Modified();
            }
        }
        this.PositionLast = this.Position;
    };
    this.FindLine = function()
    {
        var linestart = 0;
        var line = 0;
        for(var l = 0; l < this.Lines.length; l++)
        {
            if( linestart <= this.Position )
                line = l;
            linestart += this.Lines[l].length;
        }
        return line;
    };
    this.PositionToLine = function(nbr)
    {
        var line = this.FindLine();
        if( line + nbr < 0 ) nbr = 0 - line;
        if( line + nbr >= this.Lines.length ) nbr = this.Lines.length-1 - line;
        
        var linestart = 0;
        var linestart_new = 0;
        var linestart_old = 0;
        for(var l = 0; l < this.Lines.length; l++)
        {
            if( l == line +nbr )linestart_new = linestart; 
            if( l == line )linestart_old = linestart; 
            linestart += this.Lines[l].length;
        }
        this.Position -= linestart_old;
        this.Position += linestart_new;
        if( this.Position > this.Text.length ) this.Position = this.Text.length;
    };
    this.NumericModified = function()
    {
        if( this.Text == "" ){ this.Text = "0"; this.Position = 1; }
        else if( this.Text == "01" ){ this.Text = "1"; this.Position = 1; }
        else if( this.Text == "02" ){ this.Text = "2"; this.Position = 1; }
        else if( this.Text == "03" ){ this.Text = "3"; this.Position = 1; }
        else if( this.Text == "04" ){ this.Text = "4"; this.Position = 1; }
        else if( this.Text == "05" ){ this.Text = "5"; this.Position = 1; }
        else if( this.Text == "06" ){ this.Text = "6"; this.Position = 1; }
        else if( this.Text == "07" ){ this.Text = "7"; this.Position = 1; }
        else if( this.Text == "08" ){ this.Text = "8"; this.Position = 1; }
        else if( this.Text == "09" ){ this.Text = "9"; this.Position = 1; }
    };
    this.Modified = function()
    {
        if(this.Form == null)this.Form = this.FindForm();
        if(this.Form == null && FormBase != null)this.Form = FormBase;
        if(this.Form == null)return;
        this.Context = this.Form.Context;
        var font_default = this.Context.font;
        this.Context.font = Appearance.TextBox.Font;// this.Font;

        if(this.Numeric)this.NumericModified();

        if(this.Start > this.Text.length-1)this.Start = this.Text.length-1;

        if( this.MultiLine )
        {
            this.Lines = new Array("");
        
            var linestart = 0;
            var tempLine = 0;
            var tempText;
            var tempNbrChar = 0;
            var tempwidth = 0;
            for(var i = 0; i < this.Text.length; i++)
            {
                tempNbrChar++;
                tempText = this.Text.substr(linestart, tempNbrChar);
                tempwidth = this.Context.measureText(tempText).width;
                if(this.Text[i] == "\u000A")
                {
                    this.Lines[tempLine] = tempText;
                    linestart += tempNbrChar;//-1);
                    tempLine++;
                    tempNbrChar = 0;
                }
                else if (tempwidth < this.Rectangle.Width - this.Border.Left - this.Border.Right)
                {
                    this.Lines[tempLine] = tempText;
                }
                else
                {
                    linestart += (tempNbrChar-1);
                    tempLine++;
                    tempNbrChar = 0;
                    i--//Attention Dangereux!!!!!!!!!!!!!!!!!!!!!!!!!!!
                }
            }
        }
        else
        {
            if( this.Text.length == 0 )
            {
                this.Lines[0] = "";
                this.Position = 0;
                this.Start = 0;
                this.ScrollBar = 0;
            }
            else
            {
                tempText;
                tempNbrChar = 0;
                tempwidth = 0;
                for(var j = this.Start; j < this.Text.length; j++)
                {
                    tempNbrChar++;
                    tempText = this.Text.substr(this.Start, tempNbrChar);
                    tempwidth = this.Context.measureText(tempText).width;
                    if (tempwidth < this.Rectangle.Width - this.Border.Left - this.Border.Right)
                    {
                        this.Lines[0] = tempText;
                    }
                    else
                    {
                        break;
                    }
                }
            }
        }
        this.Context.font = font_default;
    };    
    this.Clear = function()
    {
        this.Start = 0;
        this.Position = 0;
        this.SpecialChar = "";
        this.ScrollBar = 0;
        if(this.Numeric) this.Text = "0";
        else this.Text = "";
        this.Modified();
    };

    this.ReadFileDropped = function(evt)
    {
        var files = evt.dataTransfer.files;
        if(files.length == 0)
        {
//            this.SetText(evt.dataTransfer.getData("text"));
            CopyText = evt.dataTransfer.getData("text");
            this.KeyPaste();
        }
//        else
//        {
//            for (var f = 0; f < files.length; f++)
//            {
//                if (files[f].type.match('image.*')) 
//                {
//                    var reader = new FileReader();
//                    reader.Control = this;
//                    reader.onload = function(e) 
//                    {
//                        this.Control.ChangeUrl(e.target.result);
//                    };
//                    reader.readAsDataURL(files[f]);
//                }
//            }
//        }
    }; 



//    this.Draw = function(x, y, width, height, context){};
//    this.OnDrawing = function(x, y, width, height, context)
//    {
//        if( this.BackColor != "" )
//        {
//            context.fillStyle = this.BackColor;
//            context.fillRect(x, y, width, height);
//            Interface_Default(context);
//        }
//        if( this.BackGroundImage != null )
//            DrawTemplateImage( this.BackGroundImage, x, y, width, height, context )
//   

////        if( this.Form == null )this.Form = this.FindForm();
////        var sender = this.Form;
//        context.font = this.Font;
//        context.textBaseline = "top";
//        
//        context.strokeRect (x, y, width, height);

//        var line = this.FindLine();
//        
//        var linestart = 0;
//        if( !this.MultiLine )linestart = this.Start;
//        var barStart = {X:0,Y:0};
//        var barEnd = {X:0,Y:0};
//        var pH = 0;
//        var nbr = 0;

//        var posX = 0;
//        var posWidth = 0;
//        var posStart = 0;
//        var posEnd = 0;
//        var recCurrent = 0;
//        if(this.DrawLast)
//        {
//            if(this.PositionLast > this.Position){ posStart = this.Position; posEnd = this.PositionLast; }
//            else { posStart = this.PositionLast; posEnd = this.Position; }
//        }
//        for( var l = 0; l < this.Lines.length; l++)
//        {

//            if( l >= this.ScrollBar && l < this.ScrollBar + this.MaxLine )
//            {
//                pH = y + this.Border.Top + (nbr * Appearance.TextBox.FontHeight);
//                
//                if(this.DrawLast)
//                {
//                    if(posStart <= linestart + this.Lines[l].length && linestart < posEnd)
//                    {
//                        posX = x+this.Border.Left;
//                        var ps = 0;
//                        var pe = this.Lines[l].length;

//                        if(linestart < posStart)
//                        {
//                            var posText = this.Lines[l].substr(0, posStart-linestart);
//                            posX += context.measureText(posText).width;
//                            ps = posStart-linestart;
//                            pe -= ps;
//                        }
//                        if(posEnd < linestart + this.Lines[l].length)
//                            pe =  posEnd-linestart-ps;

//                        posText = this.Lines[l].substr(ps, pe);
//                        posWidth = context.measureText(posText).width;
//                        
//                        context.fillStyle = "grey";
//                        if(Focus == this)context.fillStyle = "blue";
//                        context.fillRect(posX, pH, posWidth, Appearance.TextBox.FontHeight);
//                        context.fillStyle = "black";
//                    }                    
//                }
//                context.fillText( this.Lines[l], x+this.Border.Left, pH);
//   
//                if( Focus == this )
//                {
//                    if( l == line )
//                    {
//                        var d = new Date();//optimisez les variables (Global)!!!!!!!!!!!!!
//                        var mill = d.getMilliseconds();
//                        if ( mill < 500 )
//                        {
//                            var tempText = this.Lines[l].substr(0, this.Position - linestart);
//                            var tempWidth = context.measureText(tempText).width;//???????????!!!!!!!!!!!!
//                        
//                            barStart.X = barEnd.X = x + this.Border.Left + tempWidth;
//                            barStart.Y = pH;
//                            barEnd.Y = barStart.Y + Appearance.TextBox.FontHeight; 
//                         
//                            DrawLine(barStart,barEnd,context);
//                        }
//                    }
//                }
//                nbr++;
//            }
//            linestart += this.Lines[l].length;
//        }
//        
//        if(this.Text == "" && this.BackText != "")
//        {
//            var backtext = MeasureText(Translate(this.BackText), width-this.Border.Left-this.Border.Right, context);
//            context.fillStyle = "grey";
//            context.fillText( backtext, x+this.Border.Left, y+this.Border.Top);
//        }
////        context.strokeStyle = "red";
////        context.strokeRect (x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);

//        this.Draw(x, y, width, height, context);
//        Interface_Default(context);
////        if( this.Controls != null )
////            for(var i = this.Controls.length; i >= 0 ; i--)
////                if ( this.Controls[i] != null && this.Controls[i].Visible )
////                    this.Controls[i].OnDraw();



//    };




//    this.OnDraw = function()
//    {
//        if( this.BackColor != "" )
//        {
//            this.Form.Context.fillStyle = this.BackColor;
//            this.Form.Context.fillRect(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);
//            this.Form.Default();
//        }
//        if( this.BackGroundImage != null )
//            DrawTemplateImage( this.BackGroundImage, this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Form.Context )
//   

//        if( this.Form == null )this.Form = this.FindForm();
//        var sender = this.Form;
//        sender.Context.font = this.Font;
//        sender.Context.textBaseline = "top";
//        
//        sender.Context.strokeRect (this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);

//        var line = this.FindLine();
//        
//        var linestart = 0;
//        if( !this.MultiLine )linestart = this.Start;
//        var barStart = {X:0,Y:0};
//        var barEnd = {X:0,Y:0};
//        var height = 0;
//        var nbr = 0;

//        var posX = 0;
//        var posWidth = 0;
//        var posStart = 0;
//        var posEnd = 0;
//        var recCurrent = 0;
//        if(this.DrawLast)
//        {
//            if(this.PositionLast > this.Position){ posStart = this.Position; posEnd = this.PositionLast; }
//            else { posStart = this.PositionLast; posEnd = this.Position; }
//        }
//        for( var l = 0; l < this.Lines.length; l++)
//        {

//            if( l >= this.ScrollBar && l < this.ScrollBar + this.MaxLine )
//            {
//                height = this.Rectangle.Y + this.Border.Top + (nbr * Appearance.TextBox.FontHeight);
//                
//                if(this.DrawLast)
//                {
//                    if(posStart <= linestart + this.Lines[l].length && linestart < posEnd)
//                    {
//                        posX = this.Rectangle.X+this.Border.Left;
//                        var ps = 0;
//                        var pe = this.Lines[l].length;

//                        if(linestart < posStart)
//                        {
//                            var posText = this.Lines[l].substr(0, posStart-linestart);
//                            posX += sender.Context.measureText(posText).width;
//                            ps = posStart-linestart;
//                            pe -= ps;
//                        }
//                        if(posEnd < linestart + this.Lines[l].length)
//                            pe =  posEnd-linestart-ps;

//                        posText = this.Lines[l].substr(ps, pe);
//                        posWidth = sender.Context.measureText(posText).width;
//                        
//                        sender.Context.fillStyle = "grey";
//                        if(Focus == this)sender.Context.fillStyle = "blue";
//                        sender.Context.fillRect(posX, height, posWidth, Appearance.TextBox.FontHeight);
//                        sender.Context.fillStyle = "black";
//                    }                    
//                }
//                sender.Context.fillText( this.Lines[l], this.Rectangle.X+this.Border.Left, height);
//   
//                if( Focus == this )
//                {
//                    if( l == line )
//                    {
//                        var d = new Date();//optimisez les variables (Global)!!!!!!!!!!!!!
//                        var mill = d.getMilliseconds();
//                        if ( mill < 500 )
//                        {
//                            var tempText = this.Lines[l].substr(0, this.Position - linestart);
//                            var tempWidth = sender.Context.measureText(tempText).width;//???????????!!!!!!!!!!!!
//                        
//                            barStart.X = barEnd.X = this.Rectangle.X + this.Border.Left + tempWidth;
//                            barStart.Y = height;
//                            barEnd.Y = barStart.Y + Appearance.TextBox.FontHeight; 
//                         
//                            DrawLine(barStart,barEnd,sender.Context);
//                        }
//                    }
//                }
//                nbr++;
//            }
//            linestart += this.Lines[l].length;
//        }
//        
//        if(this.Text == "" && this.BackText != "")
//        {
//            var backtext = MeasureText(Translate(this.BackText), this.Rectangle.Width-this.Border.Left-this.Border.Right, this.Form.Context);
//            sender.Context.fillStyle = "grey";
//            sender.Context.fillText( backtext, this.Rectangle.X+this.Border.Left, this.Rectangle.Y+this.Border.Top);
//        }
////        sender.Context.strokeStyle = "red";
////        sender.Context.strokeRect (this.Rectangle.X+this.Border.Left, this.Rectangle.Y+this.Border.Top, this.Rectangle.Width-this.Border.Left-this.Border.Right, this.Rectangle.Height-this.Border.Top-this.Border.Bottom);

//        this.Draw(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Form.Context);
//        this.Form.Default();
//        if( this.Controls != null )
//            for(var i = this.Controls.length; i >= 0 ; i--)
//                if ( this.Controls[i] != null && this.Controls[i].Visible )
//                    this.Controls[i].OnDraw();
//    };



};

var DrawTextBox = function(x, y, width, height, context, control)
{
    if(control.MultiLine) control.MaxLine = Math.floor( (control.Rectangle.Height-control.Border.Top-control.Border.Bottom)/Appearance.TextBox.FontHeight );
        context.font = Appearance.TextBox.Font;// control.Font;// control.Appearance.Font_Default;
        context.textBaseline = "top";
        if(this.Appearance != null)
        {
            if (MouseHover.Control == this && this.Appearance.TextBox.Font_Color_Hover != "")
                context.fillStyle = this.Appearance.TextBox.Font_Color_Hover;
            else if (Focus == this && this.Appearance.TextBox.Font_Color_Focus != "")
                context.fillStyle = this.Appearance.TextBox.Font_Color_Focus;
            else if(this.Appearance.TextBox.Font_Color != "")
                context.fillStyle = this.Appearance.TextBox.Font_Color;
        }
        var line = control.FindLine();
        
        var linestart = 0;
        if( !control.MultiLine )linestart = control.Start;
        var barStart = {X:0,Y:0};
        var barEnd = {X:0,Y:0};
        var pH = 0;
        var nbr = 0;

        var posX = 0;
        var posWidth = 0;
        var posStart = 0;
        var posEnd = 0;
        var recCurrent = 0;
        if(control.DrawLast)
        {
            if(control.PositionLast > control.Position){ posStart = control.Position; posEnd = control.PositionLast; }
            else { posStart = control.PositionLast; posEnd = control.Position; }
        }
        for( var l = 0; l < control.Lines.length; l++)
        {
            if( l >= control.ScrollBar && l < control.ScrollBar + control.MaxLine )
            {
                pH = y + control.Border.Top + (nbr * Appearance.TextBox.FontHeight);
//                pH = y + control.Border.Top + (nbr * control.FontHeight);
                
                if(control.DrawLast)
                {
                    if(posStart <= linestart + control.Lines[l].length && linestart < posEnd)
                    {
                        posX = x+control.Border.Left;
                        var ps = 0;
                        var pe = control.Lines[l].length;

                        if(linestart < posStart)
                        {
                            var posText = control.Lines[l].substr(0, posStart-linestart);
                            posX += context.measureText(posText).width;
                            ps = posStart-linestart;
                            pe -= ps;
                        }
                        if(posEnd < linestart + control.Lines[l].length)
                            pe =  posEnd-linestart-ps;

                        posText = control.Lines[l].substr(ps, pe);
                        posWidth = context.measureText(posText).width;
                        
                        context.fillStyle = "grey";
                        if(Focus == control)context.fillStyle = "blue";
                        context.fillRect(posX, pH, posWidth, Appearance.TextBox.FontHeight);
//                        context.fillRect(posX, pH, posWidth, control.FontHeight);
                        context.fillStyle = "black";
                    }                    
                }
                context.fillText( control.Lines[l], x+control.Border.Left, pH);
   
                if( Focus == control )
                {
                    if( l == line )
                    {
                        var d = new Date();//optimisez les variables (Global)!!!!!!!!!!!!!
                        var mill = d.getMilliseconds();
                        if ( mill < 500 )
                        {
                            var tempText = control.Lines[l].substr(0, control.Position - linestart);
                            var tempWidth = context.measureText(tempText).width;//???????????!!!!!!!!!!!!
                        
                            barStart.X = barEnd.X = x + control.Border.Left + tempWidth;
                            barStart.Y = pH;
                            barEnd.Y = barStart.Y + Appearance.TextBox.FontHeight; 
//                            barEnd.Y = barStart.Y + control.FontHeight;
                         
                            DrawLine(barStart,barEnd,context);
                        }
                    }
                }
                nbr++;
            }
            linestart += control.Lines[l].length;
        }
        
        if(control.Text == "" && control.BackText != "")
        {
            var backtext = MeasureText(Translate(control.BackText), width-control.Border.Left-control.Border.Right, context);
            if(this.Appearance != null)
            {
                if(this.Appearance.TextBox.BackFont != "")
                    context.font = this.Appearance.TextBox.BackFont;
                
                if(this.Appearance.TextBox.BackFont_Color != "")
                    context.fillStyle = this.Appearance.TextBox.BackFont_Color;
                else 
                    context.fillStyle = "grey";
                context.fillText( backtext, x+control.Border.Left, y+control.Border.Top);
            }
        }
};




//var FunctionKeyDown = function()
//{
//    if(this.Parent != null && this.ReadOnly){ this.Parent.OnKeyDown(); return; }
//	if ( Modifiers.Value == "^" && this.SpecialChar == "" )this.SpecialChar = "^";
//	else if ( Modifiers.Value == "¨" && this.SpecialChar == "" )this.SpecialChar = "¨";
//	else if ( Modifiers.Value == "~" && this.SpecialChar == "" )this.SpecialChar = "~";
//	else if ( this.CanWrite(Modifiers.Value) )
//    {
//        if ( this.MaxLength != undefined && this.Text.length >= this.MaxLength )return;
//        if (this.SpecialChar != "")
//        {
//            var specialchar = undefined;
//            if (this.SpecialChar == "^")specialchar = Circumflex[Modifiers.Value];
//            else if (this.SpecialChar == "¨")specialchar = Diaeresis[Modifiers.Value];
//            else if (this.SpecialChar == "~")specialchar = Tilde[Modifiers.Value];
//            
//            if (specialchar == undefined)
//            {
//                Modifiers.Value = this.SpecialChar + Modifiers.Value;
//                ++this.Position;
//            }
//            else Modifiers.Value = specialchar;
//            this.SpecialChar = "";
//        }
//        var tempText1 = this.Text.substr(0, this.Position);
//        var tempText2 = this.Text.substr(this.Position, this.Text.length);     
//        this.Text = tempText1 + Modifiers.Value + tempText2;
//        ++this.Position;
//        this.Modified();
//        this.TextChanged();
//        this.PositionChanged();
//    }
//    else
//	{
//	    this.Action();
//	}
//};

//var FunctionAction = function()
//{
//    switch(Modifiers.Value)
//    {
//        case "" :
//            break;
//        case "Enter" :
//            this.KeyEnter();
//            break;
//        case "Space" :
//            this.KeySpace();
//            break;
//        case "LeftArrow" :
//            this.KeyLeftArrow();
////            if( this.Position > 0 )
////            {
////                --this.Position;
////                this.PositionChanged();
////            }   
//            break;
//        case "RightArrow" :
//            this.KeyRightArrow();
////            if( this.Position < this.Text.length )
////            {
////                ++this.Position;
////                this.PositionChanged();
////            }   
//            break;
//        case "UpArrow" :
//            this.KeyUpArrow();
////            if( this.MultiLine )
////            {
////                this.PositionToLine(-1);
////                this.PositionChanged();
////            }   
//            break;
//        case "DownArrow" :
//            this.KeyDownArrow();
////            if( this.MultiLine )
////            {
////                this.PositionToLine(1);
////                this.PositionChanged();   
////            }
//            break;
//        case "Backspace" :
//            this.KeyBackspace();
//            break;
//        case "Delete" :
//            this.KeyDelete();
//            break;
//        case "Esc" :
//            this.KeyEsc();
////            Focus = null;
////            this.SpecialChar = "";
//            break;
//        case "Tab" :
//            this.KeyTab();
////            if(this.Tab != null)
////                this.Tab.OnFocus();
//            break;
//        case "Copy" :
//            this.KeyCopy();
//            break;
//        case "Paste" :
//            this.KeyPaste();
//            break;
//    }
//};
        
            
            






var Circumflex =
{
    "a":"â",
    "A":"Â",
    "e":"ê",
    "E":"Ê",
    "i":"î",
    "I":"Î",
    "o":"ô",
    "O":"Ô",
    "u":"û",
    "U":"Û"
};
var Diaeresis =
{
    "a":"ä",
    "A":"Ä",
    "e":"ë",
    "E":"Ë",
    "i":"ï",
    "I":"Ï",
    "o":"ö",
    "O":"Ö",
    "u":"ü",
    "U":"Ü"
};
 
var Tilde =
{
    "a":"ã",
    "A":"Ã",
    "e":"ẽ",
    "E":"Ẽ",
    "i":"ĩ",
    "I":"Ĩ",
    "o":"õ",
    "O":"Õ",
    "u":"ũ",
    "U":"Ũ"
};

var Bar =
{
    "a":"ⱥ",
    "A":"Ⱥ",
    "e":"ɇ",
    "E":"Ɇ",
    "i":"ɨ",
    "I":"Ɨ",
    "o":"ø",
    "O":"Ø",
    "u":"ʉ",
    "U":"Ʉ"
};
