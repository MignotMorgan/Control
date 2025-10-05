
var Focus = null;
var Transformation = { Control:null, X:0, Y:0, Resize:false, Border:5, Left:false, Top:false, Right:false, Bottom:false, Lock:false };
var MouseHover = { Control:null, Selected:null};
var DragDrop = { Control:null, Element:null };
var Controls = new Array();
var FullScreen = { Control:null, Element:null, Enabled:document.mozFullScreenEnabled || document.webkitFullscreenEnabled || document.msFullscreenEnabled };

//var LastTime = {Move:Now() };

// à faire !!!
//CHANGER Rectangle et Border en this.X; this.Y ect...!!!!!!!!!!!!!!!!!!!!
//Ajouter OnClear() + Clear() à Control
//Modifier Set et Get en function de base dans le Control
// ajouter Linked dans TextList et ControlList

//Changer Draw() en var Function_Draw = function(){}; //fonction externe
//Ajouter une variable this.Text et this.Info à Control

//Créer un Control Information : Delay, Latence, Name, Mouse, Case, ect...
//Placer les function DRAW dans une fonction exterieur : var Draw = function(){};
//Permettre le click souris sur Up ou Down Interface.MouseUp
//Utiliser % pour this.Rectangle
//Supprimer et verifier Form.Frame & Form.Rectangle
//Modifier en OnCLick, OnDoubleCick

//this.Controls[] Ajouter une fonction Clear et Remove pour Controls et verif control n'est pas contenu dans une liste Controls (ex: control.Index = -1)
//      +Changer le nom de la variable this.Index + verif this.FirstPosition!!!

//ClipCanvas OnClip() CREER une BARRE GLISSANTE Horizontale, Verticale

function OnMouseMove_Control()
{
//    LastTime.Move = Now();
    MouseHover.Selected = null;
    for(var i = 0; i < Controls.length; i++)
        if( Controls[i].ContainMouse() )
            Controls[i].OnMouseHover();
    //Drag&Drop
    if( MouseHover.Control != MouseHover.Selected )
    {
        if( MouseHover.Control != null )
        {
            if(DragDrop.Control != null)DragDrop.Control.OnDragLeave();
            MouseHover.Control.OnMouseLeave();
        }
        if( MouseHover.Selected != null )
        {
            MouseHover.Selected.OnMouseEnter();
            if(DragDrop.Control != null)DragDrop.Control.OnDragEnter();
        }
        MouseHover.Control = MouseHover.Selected;
    }
    if(MouseHover.Control != null && DragDrop.Control != null)DragDrop.Control.OnDragOver();
    //Resize&Move
    if(Transformation.Control == null)//+FullScreen
    {
        Transformation.Left = false;
        Transformation.Right = false;
        Transformation.Top = false;
        Transformation.Bottom = false;
        
        if( MouseHover.Control != null && MouseHover.Control.CanResize )
        {
            if(Mouse.X <= MouseHover.Control.Form.Position.X + MouseHover.Control.Rectangle.X + Transformation.Border)Transformation.Left = true;
            if(Mouse.Y <= MouseHover.Control.Form.Position.Y + MouseHover.Control.Rectangle.Y + Transformation.Border)Transformation.Top = true;
            if(Mouse.X >= MouseHover.Control.Form.Position.X + MouseHover.Control.Rectangle.X + MouseHover.Control.Rectangle.Width - Transformation.Border)Transformation.Right = true;
            if(Mouse.Y >= MouseHover.Control.Form.Position.Y + MouseHover.Control.Rectangle.Y + MouseHover.Control.Rectangle.Height - Transformation.Border)Transformation.Bottom = true;
        }
    }
    else if( Transformation.Resize ) 
    {
        if(Transformation.Lock)return;
        Transformation.Lock = true;
        Transformation.Control.OnResize();
        Transformation.Lock = false;
    }
    else { Transformation.Control.OnMove(); }
    
    if(MouseHover.Control != null)MouseHover.Control.MouseMove();
};
function Control_OnTransformation()
{
    if(MouseHover.Control != null)
        MouseHover.Control.OnTransformation();
};
function Control_OnDrag()
{
    if(MouseHover.Control != null && MouseHover.Control.CanDrag)
        MouseHover.Control.OnDrag();
};
function Control_OnDrop()
{
    if(DragDrop.Control != null && MouseHover.Control != null && MouseHover.Control.CanDrop)
        MouseHover.Control.OnDrop();
    DragDrop.Control = null;
    DragDrop.Element = null;

};
function Control_OnClear()
{
    Modifiers.Keycode = 0;
    Modifiers.Value = "";
//    Focus = null;
    if(Transformation.Control != null)
    {
        if(Transformation.Resize && Transformation.Control.CanScale)Transformation.Control.ScaleEnd();
        else if(Transformation.Resize)Transformation.Control.ResizeEnd();
        else Transformation.Control.MoveEnd();
    }
    Transformation.Control = null;
    Transformation.Resize = false;
    Transformation.Lock = false;
};
function Draw_Control()
{
    for(var i = 0; i < Controls.length; i++)
        Controls[i].OnDraw(undefined, 0, 0);//();
            
    if(DragDrop.Control != null)
        DragDrop.Control.OnDragDraw();
        
//    if(LastTime.Move + PageInfo.IntervalInfo < Now())alert();
//        Draw_Info();
};
//function Draw_Info()
//{
//    if(MouseHover.Control != null && MouseHover.Control.Info != "")
//    {
//        var context = MouseHover.Control.Form.Context;
//        var x = Mouse.X - MouseHover.Control.Form.Position.X;
//        var y = Mouse.Y - MouseHover.Control.Form.Position.Y;
//        
//        context.fillText(LastTime.Move, x, y );
////        context.fillText(MouseHover.Control.Info, x, y );
//    }
//};
function ClearRec_Control()
{
    for(var i = 0; i < Controls.length; i++)
        Controls[i].Context.clearRect(0, 0, Controls[i].Rectangle.Width, Controls[i].Rectangle.Height);
}

//?????????????????????????????Mouse SCROLL????????
function OnMouseWheel_Control(rolled)
{
    if( MouseHover.Control != null)MouseHover.Control.OnMouseWheel(rolled);

    MouseHover.Selected = null;
    for(var i = 0; i < Controls.length; i++)
        if( Controls[i].ContainMouse() )
            Controls[i].OnMouseHover();

    if( MouseHover.Control != MouseHover.Selected )
    {
        if( MouseHover.Control != null )MouseHover.Control.OnMouseLeave();
        if( MouseHover.Selected != null )MouseHover.Selected.OnMouseEnter();
        MouseHover.Control = MouseHover.Selected;
    }
    return false;
};
function MouseScroll (event) 
{
    var rolled = 0;
    if ('wheelDelta' in event){ rolled = event.wheelDelta; }
    else { rolled = -40 * event.detail; }
    OnMouseWheel_Control(rolled);
    return false;
};
function dragEnter(evt)
{
    evt.stopPropagation();
    evt.preventDefault(); 
}
function dragExit(evt)
{
    evt.stopPropagation();
    evt.preventDefault();
}
function dragOver(evt)
{
    evt.stopPropagation();
    evt.preventDefault();
    OnMouseMove(evt);
}
function drop(evt)
{
    evt.stopPropagation();
    evt.preventDefault();

    if(MouseHover.Control != null && MouseHover.Control.CanDrop)
        MouseHover.Control.ReadFileDropped(evt);
};

function Control_FindID(id)
{
    var control = null;
    for(var i = 0; i < Controls.length; i++)
        if(control == null)
            control = Controls[i].FindID(id);
return control;
};

function Control_IsFullScreen()
{
    return document.mozFullScreenElement != null || document.webkitFullscreenElement != null || document.msFullscreenElement != null;
};
function Control_FullScreenElement()
{
    if(document.mozFullScreenElement != null)return document.mozFullScreenElement;
    else if(document.webkitFullscreenElement != null)return document.webkitFullscreenElement;
    else if(document.msFullscreenElement != null)return document.msFullscreenElement;
};
function Control_ExitFullScreen()
{
    if (document.mozCancelFullScreen)
        document.mozCancelFullScreen();
    else if(document.webkitExitFullscreen)
        document.webkitExitFullscreen();
    else if(document.msExitFullscreen)
        document.msExitFullscreen();
};
function Control_FullScreenChange(event)
{
    var element = Control_FullScreenElement();
//    var element = null;
//    if(document.mozFullScreenElement != null)element = document.mozFullScreenElement;
//    else if(document.webkitFullscreenElement != null)element = document.webkitFullscreenElement;
//    else if(document.msFullscreenElement != null)element = document.msFullscreenElement;
    
    if(element != null)// && element.Form != null)
    {
        if(element.Form != null)
        {
        
            FullScreen.Control = element.Form;
            FullScreen.Element = element;
    //        FullScreen.Control.ResizeTo( screen.width, screen.height);
            var w = screen.width / FullScreen.Control.Rectangle.Width;
            var h = screen.height / FullScreen.Control.Rectangle.Height;
            FullScreen.Control.FullScreenTo(w,h);
            FullScreen.Control.Position.X = 0;
            FullScreen.Control.Position.Y = 0;
//        FullScreen.Control.ScaleTo(w,h);
        
//        alert(element.width +" : "+ element.height +" Form : "+ element.Form.Rectangle.Width +" : "+ element.Form.Rectangle.Height);
        }
    }
    else
    {
        var w = FullScreen.Control.Frame.Width /screen.width;
        var h = FullScreen.Control.Frame.Height / screen.height;
        FullScreen.Control.FullScreenTo(w,h);
        FullScreen.Control.Position.X = FullScreen.Control.Frame.X;
        FullScreen.Control.Position.Y = FullScreen.Control.Frame.Y;
            FullScreen.Control = null;
            FullScreen.Element = null;
    }


//    alert(FullScreen.Enabled);
    
//    alert(FullScreen.Element.style.left +"  "+ FullScreen.Element.style.top +"  "+ FullScreen.Element.width +"  "+ FullScreen.Element.height);

//    alert(document.mozFullScreenElement.Form != null);
//alert("CHANGE : " + event);
// fullscreenStatus(moz, document.mozFullScreenEnabled,document.mozFullScreenElement)
};
function Control_FullScreenError(event){};


function Form(x, y, width, height, params)
{
    this.InheritClass = Control;
    this.InheritClass(0, 0, width, height, params);
    delete this.InheritClass;
    this.Inherit("Form");
 
    this.AppearanceType = "Form";
    this.CanMove = true;
      
    this.Canvas = document.createElement('canvas');
    document.body.appendChild(this.Canvas);
    this.Canvas.style.position = 'absolute';
	this.Canvas.style.left = x+"px";
	this.Canvas.style.top = y+"px";
    this.Canvas.width = width;
    this.Canvas.height = height;
    this.Context = this.Canvas.getContext("2d");

    this.Canvas.Form = this;
    
    if (this.Canvas.addEventListener) 
    {
        this.Canvas.addEventListener ("mousewheel", MouseScroll, false);
        this.Canvas.addEventListener ("DOMMouseScroll", MouseScroll, false);
        this.Canvas.addEventListener("dragenter", dragEnter, false);
        this.Canvas.addEventListener("dragexit", dragExit, false);
        this.Canvas.addEventListener("dragover", dragOver, false);
        this.Canvas.addEventListener("drop", drop, false);
    }
    else if (this.Canvas.attachEvent)
    {
        this.Canvas.attachEvent ("onmousewheel", MouseScroll);
        this.Canvas.attachEvent("dragenter", dragEnter);
        this.Canvas.attachEvent("dragexit", dragExit);
        this.Canvas.attachEvent("dragover", dragOver);
        this.Canvas.attachEvent("drop", drop);
    }

    this.Form = this;
    this.Frame = {X:x, Y:y, Width:width, Height:height};
    this.Position = {X:x, Y:y}; 
//    this.Reduce = false;
    this.Reduce = {Active:false, X:-50, Y:-50, Width:50, Height:50};

    this.Index = Controls.length;
    Controls[Controls.length] = this;

    this.OnMove = function()
    {
        if(Control_IsFullScreen())return;
        var x = Mouse.X - Transformation.X;
        var y = Mouse.Y - Transformation.Y;
        this.MoveTo(x, y);
    };
    this.MoveTo = function(x, y)
    {
        if(Control_IsFullScreen())return;
    	this.Canvas.style.top = y+"px";
    	this.Canvas.style.left = x+"px";
    	this.Frame.X = x;
    	this.Frame.Y = y;
    	this.Position.X = x;
    	this.Position.Y = y;
    	this.Location.X = x;
    	this.Location.Y = y;
    	
        this.Rectangle.X = 0;
        this.Rectangle.Y = 0;

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentMove();
        this.Moved();
    };
    this.OnResize = function()//Verif FullScreen
    {
        if(Control_IsFullScreen())return;
        var left = this.Position.X;
        var top = this.Position.Y;
        var right = this.Position.X + this.Rectangle.Width;
        var bottom = this.Position.Y + this.Rectangle.Height;

        if( Transformation.Left )left = Mouse.X;
        if( Transformation.Top )top = Mouse.Y;
        if( Transformation.Right )right = Mouse.X;
        if( Transformation.Bottom )bottom = Mouse.Y;

        if(this.CanScale)
        {
            var width = right - left;
            var height = bottom - top;
            var ratio_width = width / this.Rectangle.Width;
            var ratio_height = height / this.Rectangle.Height;

            var ratio_size = this.MinimumScale( {Width:ratio_width, Height:ratio_height} );
            if(Transformation.Left && ratio_size.Width == 1)left = this.Position.X;
            if(Transformation.Top && ratio_size.Height == 1)top = this.Position.Y;
            if(Transformation.Left || Transformation.Top)
                this.MoveToScale(left, top);
            this.ScaleTo(ratio_size.Width, ratio_size.Height);
        }
        else
        {
            if(Transformation.Left || Transformation.Top)
                this.MoveTo(left, top);
            this.ResizeTo(right - left, bottom - top);
        }
    };
    this.ResizeTo = function(width, height)
    {
        if(Control_IsFullScreen())return;
    	this.Canvas.width = width;
    	this.Canvas.height = height;

        this.Frame.Width = width;
        this.Frame.Height = height;

        this.Rectangle.Width = width;
        this.Rectangle.Height = height;

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentResize();

        this.Resized();
    };
    this.ScaleTo = function(ratio_width, ratio_height)
    {
        if(Control_IsFullScreen())return;
    	this.Canvas.width = this.Rectangle.Width * ratio_width;
    	this.Canvas.height = this.Rectangle.Height * ratio_height;

        this.Frame.Width = this.Rectangle.Width * ratio_width;
        this.Frame.Height = this.Rectangle.Height * ratio_height;
        this.Rectangle.Width = this.Rectangle.Width * ratio_width;
        this.Rectangle.Height = this.Rectangle.Height * ratio_height;

        this.Border.Left = this.Border.Left * ratio_width;
        this.Border.Right = this.Border.Right * ratio_width;
        this.Border.Top = this.Border.Top * ratio_height;
        this.Border.Bottom = this.Border.Bottom * ratio_height;

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentScale(ratio_width, ratio_height);

        this.Scaled(ratio_width, ratio_height);
    };
    this.MoveToScale = function(x, y)
    {
    	this.Canvas.style.top = y+"px";
    	this.Canvas.style.left = x+"px";
    	this.Frame.X = x;
    	this.Frame.Y = y;
    	this.Position.X = x;
    	this.Position.Y = y;
    	this.Location.X = x;
    	this.Location.Y = y;
    };

    this.Reducing = function()
    {
        if(this.Reduce.Active)
        {
            this.Reduce.Active = false;
            this.ReduceTo(this.Frame.X, this.Frame.Y, this.Frame.Width, this.Frame.Height);
        }
        else
        {
            this.Reduce.Active = true;
            this.ReduceTo(this.Reduce.X, this.Reduce.Y, this.Reduce.Width, this.Reduce.Height);
//            this.ReduceTo(-50, -50, 50, 50);
        }
    };
    this.ReduceTo = function(x, y, width, height)
    {
        if(Control_IsFullScreen())return;
    	this.Canvas.style.top = y+"px";
    	this.Canvas.style.left = x+"px";
    	this.Canvas.width = width;
    	this.Canvas.height = height;

    	this.Position.X = x;
    	this.Position.Y = y;
    	this.Location.X = x;
    	this.Location.Y = y;
    	
        this.Rectangle.X = 0;
        this.Rectangle.Y = 0;
        this.Rectangle.Width = width;
        this.Rectangle.Height = height;

        this.Reduced();
    };
    this.Reduced = function(){};
    
    this.Default = function() { Interface_Default(this.Context); }; 

    this.ContainMouse = function()
    {
        return ( Mouse.X > this.Position.X && Mouse.X < this.Position.X + this.Rectangle.Width 
                && Mouse.Y > this.Position.Y && Mouse.Y < this.Position.Y + this.Rectangle.Height );
    };
    this.OnMouseEnter = function(){};
    this.OnMouseLeave = function(){};
    
    this.OnClip = function(){};
//    this.Draw = function(x, y, width, height, context){};
    this.OnDraw = function(context, x, y)
    {
        this.OnDrawing(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Context);

        if( this.Controls != null )
            for(var i = this.Controls.length; i >= 0 ; i--)
                if ( this.Controls[i] != null && this.Controls[i].Visible )
                    this.Controls[i].OnDraw(this.Context, x, y);
                    
        this.DrawUp(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Context);
    };

    this.CallPage = function( COMMAND, value ){ CallPage( COMMAND, this.Index +PageInfo.Separator+ value ); };
    this.ResponsePage = function(message){};

    this.OnFullScreen = function()
    {
        if(this.Canvas.webkitRequestFullScreen)
            this.Canvas.webkitRequestFullScreen();
        else if(this.Canvas.msRequestFullscreen)
            this.Canvas.msRequestFullscreen();
        else if(this.Canvas.mozRequestFullScreen)
            this.Canvas.mozRequestFullScreen();
//        else if (this.Canvas.oRequestFullScreen)
//            this.Canvas.oRequestFullScreen();
//        else if (this.Canvas.requestFullscreen)
//            this.Canvas.requestFullscreen();
    };
    this.FullScreenTo = function(ratio_width, ratio_height)
    {
    	this.Canvas.width = this.Rectangle.Width * ratio_width;
    	this.Canvas.height = this.Rectangle.Height * ratio_height;

        this.Rectangle.Width = this.Rectangle.Width * ratio_width;
        this.Rectangle.Height = this.Rectangle.Height * ratio_height;

        this.Border.Left = this.Border.Left * ratio_width;
        this.Border.Right = this.Border.Right * ratio_width;
        this.Border.Top = this.Border.Top * ratio_height;
        this.Border.Bottom = this.Border.Bottom * ratio_height;

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentScale(ratio_width, ratio_height);

        this.FullScreened(ratio_width, ratio_height);
    };
    this.FullScreened = function(ratio_width, ratio_height){};
};

function InheritObject()
{
    this.InheritType = new Array();
    this.InheritType.push("InheritObject");
    this.Inherit = function(inherittype){ this.InheritType.push(inherittype); };
    this.IsInherit = function(inherittype)
    {
        for(var i = 0; i < this.InheritType.length; i++)
            if( this.InheritType[i] == inherittype )
                return true;
        return false;
    };
};
function Control(x, y, width, height, params)
{
    this.InheritClass = InheritObject;
    this.InheritClass();
    delete this.InheritClass;
    this.Inherit("Control");
    
    this.AppearanceType = "Control";
    this.Appearance = null;
    this.Form = null;
    this.Parent = null;
    this.Rectangle = {X:x, Y:y, Width:width, Height:height};
    this.Location = {X:x, Y:y};
    this.MinSize = {Width:width/5, Height:height/5};

    this.Controls = null;
    this.MaxCount = -1;
    this.Index = 0;

    this.Text = "";
    this.SetText = function(txt){ this.Text = txt; };
    this.GetText = function(){ return this.Text; };

    this.ID = "";
    this.Border = {Left:0, Top:0, Right:0, Bottom:0};
    this.BackColor = "";
    this.BackGroundImage = null;
    this.BackTransparent = false; //ne pas utiliser si Background provient d'un site externe!!!!!!
    this.CanFocus = true;
    this.CanMove = false;
    this.CanResize = false;
    this.CanScale = false;
    this.Visible = true;
    this.Enabled = true;
    this.CanDrag = false;
    this.CanDrop = false;
    this.Info = "";
    this.Tab = null;


    if (params != null)
    {
//        if(isNaN(params))
        if(typeof(params) == "object")
        {
            if(params.ID != null)this.ID = params.ID;
            if(params.Left != null)this.Border.Left = params.Left;
            if(params.Top != null)this.Border.Top = params.Top;
            if(params.Right != undefined)this.Border.Right = params.Right;
            if(params.Bottom != undefined)this.Border.Bottom = params.Bottom;
            if(params.Border != undefined)this.Border = {Left:params.Border, Top:params.Border, Right:params.Border, Bottom:params.Border};
//            this.Border = {Left:params.Left, Top:params, Right:params, Bottom:params};
        }
            //Supprimer!!!

        else if(typeof(params) == "string")
            this.ID = params;
        else if(typeof(params) == "number")
            this.Border = {Left:params, Top:params, Right:params, Bottom:params};
    }

    this.Right = function(){ return this.Rectangle.X + this.Rectangle.Width; };
    this.Bottom = function(){ return this.Rectangle.Y + this.Rectangle.Height; };
    this.FindForm = function()
    {
        if( this.Form != null )
            return this.Form;
        else if( this.Parent != null )
            return this.Parent.FindForm();
    };
    this.FindID = function(id)
    {
        if(this.ID == id) return this;
        var control = null;
        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                if(control == null)
                    control = this.Controls[i].FindID(id);
//                if( this.Controls[i].ID == id)
//                    return this.Controls[i];
//                else
//                    control = this.Controls[i].FindID(id);
    return control;
    };
    this.ContainMouse = function()
    {
        if( this.Form == null )this.Form = this.FindForm();
        return ( Mouse.X > this.Form.Position.X +  this.Rectangle.X && Mouse.X < this.Form.Position.X + this.Rectangle.X + this.Rectangle.Width 
                && Mouse.Y > this.Form.Position.Y + this.Rectangle.Y && Mouse.Y < this.Form.Position.Y + this.Rectangle.Y + this.Rectangle.Height );
    };
    this.OnFocus = function()
    {
        if( this.CanFocus ){ Focus = this; this.FirstPosition(null); this.Focused (); }
        else if ( this.Parent != null ) this.Parent.OnFocus();
    };
    this.Focused = function(){};
    this.Add = function(control)
    {
        if(this.MaxCount == 0) return false;
        if(this.Controls == null) this.Controls = new Array();
        if(this.MaxCount > -1 && this.MaxCount <= this.Controls.length) return false;
        
        control.Parent = this;
        control.Index = this.Controls.length;
        this.Controls[this.Controls.length] = control;
        control.ParentChanged();//Supprimer!!!!!!!!!
        return true;
    };
    this.ParentChanged = function()//Supprimer!!!!!!!!!!!!! Soit garder this.FormChanged ou this.ParentChanged
    {
        this.FormChanged();
        this.MoveTo(this.Parent.Rectangle.X+this.Parent.Border.Left+this.Location.X, this.Parent.Rectangle.Y+this.Parent.Border.Top+this.Location.Y);
    };
    this.FormChanged = function()
    {
        this.Form = this.Parent.Form;
        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].FormChanged();
    };
    this.Remove = function(control)
    {
        var tempControls = new Array();
        for(var i = 0; i < this.Controls.length; i++)
            if( this.Controls[i] != control)
            {
                tempControls[tempControls.length] = this.Controls[i];
                tempControls[tempControls.length-1].Index = tempControls.length-1;
            }
        this.Controls = tempControls;
        return true;
    };
    this.FirstPosition = function(control)
    {
        if(control != null && control.Index > 0)
        {
            for( var i = control.Index; i > 0; i-- )
            {
                if(!control.CanMove && this.Controls[i-1].CanMove)return;
                this.Controls[i] = this.Controls[i-1];
                this.Controls[i].Index = i;
                this.Controls[i-1] = control;
                this.Controls[i-1].Index = i-1;
            }
        }
        if(this.Parent != null) this.Parent.FirstPosition(this);
    };
    this.OnTransformation = function()
    {
        if(  Transformation.Left || Transformation.Top || Transformation.Right || Transformation.Bottom )
        {
            Transformation.Control = this;
            Transformation.Resize = true;
        }
        else if( this.CanMove )
        {
            if( this.Form == null )this.Form = this.FindForm();
            Transformation.Control = this;
            Transformation.X = Mouse.X - this.Form.Position.X - this.Rectangle.X;
            Transformation.Y = Mouse.Y - this.Form.Position.Y - this.Rectangle.Y;
        }
        else if ( this.Parent != null )
            this.Parent.OnTransformation();
    };

    this.OnMove = function()
    {
        var x = Mouse.X - this.Form.Position.X - Transformation.X;
        var y = Mouse.Y - this.Form.Position.Y - Transformation.Y;

        if( this.Parent != null && this.Parent.ClipContext == null && !this.Parent.IsInherit("Form") )
        {
            if(Modifiers.Ctrl)
                this.MoveToOut(x, y);
            else
                this.MoveToIn(x, y);
        }
        else
        {
            this.MoveTo(x, y);
        }
    };
    this.MoveToIn = function(x, y)
    {
        if( x > this.Parent.Right() - this.Parent.Border.Right - this.Rectangle.Width ) x = this.Parent.Right() - this.Rectangle.Width - this.Parent.Border.Right;
        if( y > this.Parent.Bottom() - this.Parent.Border.Bottom - this.Rectangle.Height ) y = this.Parent.Bottom() - this.Rectangle.Height - this.Parent.Border.Bottom;
        if( x < this.Parent.Rectangle.X + this.Parent.Border.Left ) x = this.Parent.Rectangle.X + this.Parent.Border.Left;
        if( y < this.Parent.Rectangle.Y + this.Parent.Border.Top ) y = this.Parent.Rectangle.Y + this.Parent.Border.Top;
        this.MoveTo(x, y);
    };
    this.MoveToOut = function(x, y)
    {
        if( x > this.Parent.Right() - this.Rectangle.Width ) x = this.Parent.Right() - this.Rectangle.Width;
        if( y > this.Parent.Bottom() - this.Rectangle.Height ) y = this.Parent.Bottom() - this.Rectangle.Height;
        if( x < this.Parent.Rectangle.X  ) x = this.Parent.Rectangle.X;
        if( y < this.Parent.Rectangle.Y ) y = this.Parent.Rectangle.Y;
        this.MoveTo(x, y);
    };
    this.MoveTo = function(x, y)
    {
        this.Location.X = this.Parent == null ? x : x - this.Parent.Rectangle.X-this.Parent.Border.Left;
        this.Location.Y = this.Parent == null ? y : y - this.Parent.Rectangle.Y-this.Parent.Border.Top;
        this.Rectangle.X = x;
        this.Rectangle.Y = y;

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentMove();
        this.Moved();
    };
    this.ParentMove = function()
    {
        this.MoveTo(this.Parent.Rectangle.X+this.Parent.Border.Left + this.Location.X, this.Parent.Rectangle.Y+this.Parent.Border.Top + this.Location.Y);
    };
    this.Moved = function(){};
    this.MoveEnd = function(){};

    this.OnResize = function()
    {
        var left = this.Rectangle.X;
        var top = this.Rectangle.Y;
        var right = this.Rectangle.X + this.Rectangle.Width;
        var bottom = this.Rectangle.Y + this.Rectangle.Height;
//        var minsize =  Transformation.Border*2;
        var minsizeWidth = this.Border.Left+this.Border.Right+1 > Transformation.Border*2 ? this.Border.Left+this.Border.Right+1 : Transformation.Border*2;
        var minsizeHeight = this.Border.Top+this.Border.Bottom+1 > Transformation.Border*2 ? this.Border.Top+this.Border.Bottom+1 : Transformation.Border*2;
        if( Transformation.Left )
        {
            left = Mouse.X - this.Form.Position.X;
            if( this.Parent != null && this.Parent.ClipCanvas == null && !this.Parent.IsInherit("Form") && left < this.Parent.Rectangle.X + this.Parent.Border.Left )left = this.Parent.Rectangle.X + this.Parent.Border.Left;
            if( left > this.Right() - minsizeWidth )left = this.Right() - minsizeWidth;

            if( this.Controls != null && !this.CanScale && this.ClipCanvas == null )
                for(var l = 0; l < this.Controls.length; l++)
                    if( left + this.Controls[l].Location.X + this.Controls[l].Rectangle.Width + this.Border.Left + this.Border.Right > right )
                        left = right - this.Controls[l].Location.X - this.Controls[l].Rectangle.Width - this.Border.Left - this.Border.Right;
        }
        if( Transformation.Top )
        {
            top = Mouse.Y - this.Form.Position.Y;
            if( this.Parent != null && this.Parent.ClipCanvas == null && !this.Parent.IsInherit("Form") && top < this.Parent.Rectangle.Y + this.Parent.Border.Top ) top = this.Parent.Rectangle.Y + this.Parent.Border.Top;
            if( top > this.Bottom() - minsizeHeight )top = this.Bottom() - minsizeHeight;

            if( this.Controls != null && !this.CanScale && this.ClipCanvas == null )
                for(var t = 0; t < this.Controls.length; t++)
                    if( top + this.Controls[t].Location.Y + this.Controls[t].Rectangle.Height + this.Border.Top + this.Border.Bottom > bottom )
                        top = bottom - this.Controls[t].Location.Y - this.Controls[t].Rectangle.Height - this.Border.Top - this.Border.Bottom;
        }
        if( Transformation.Right )
        {
            right = Mouse.X - this.Form.Position.X;
            if( this.Parent != null && this.Parent.ClipCanvas == null && !this.Parent.IsInherit("Form") && right > this.Parent.Rectangle.X + this.Parent.Rectangle.Width - this.Parent.Border.Right ) right =  this.Parent.Rectangle.X + this.Parent.Rectangle.Width - this.Parent.Border.Right;
            if( right < this.Rectangle.X + minsizeWidth )right = this.Rectangle.X + minsizeWidth;

            if( this.Controls != null && !this.CanScale && this.ClipCanvas == null )
                for(var r = 0; r < this.Controls.length; r++)
                    if( left + this.Controls[r].Location.X + this.Controls[r].Rectangle.Width + this.Border.Left + this.Border.Right > right )
                        right = left + this.Controls[r].Location.X + this.Controls[r].Rectangle.Width + this.Border.Left + this.Border.Right;
        }
        if( Transformation.Bottom )
        {
            bottom = Mouse.Y - this.Form.Position.Y;
            if( this.Parent != null && this.Parent.ClipCanvas == null && !this.Parent.IsInherit("Form") && bottom > this.Parent.Rectangle.Y + this.Parent.Rectangle.Height - this.Parent.Border.Bottom ) bottom = this.Parent.Rectangle.Y + this.Parent.Rectangle.Height - this.Parent.Border.Bottom;
            if( bottom < this.Rectangle.Y + minsizeHeight )bottom = this.Rectangle.Y + minsizeHeight;

            if( this.Controls != null && !this.CanScale && this.ClipCanvas == null )
                for(var b = 0; b < this.Controls.length; b++)
                    if( top + this.Controls[b].Location.Y + this.Controls[b].Rectangle.Height + this.Border.Top + this.Border.Bottom > bottom )
                        bottom = top + this.Controls[b].Location.Y + this.Controls[b].Rectangle.Height + this.Border.Top + this.Border.Bottom;
        }
        if(this.ClipCanvas != null)
        {
            if( right - left -this.Border.Left-this.Border.Right < 2)
            {
                if( Transformation.Left )left = this.Rectangle.X;
                if( Transformation.Right )right = this.Rectangle.X + this.Rectangle.Width;
            }
            if( bottom - top -this.Border.Top-this.Border.Bottom < 2)
            {
                if( Transformation.Top )top = this.Rectangle.Y;
                if( Transformation.Bottom )bottom = this.Rectangle.Y + this.Rectangle.Height;
            }
        }
        if(this.CanScale)
        {
            var width = right - left;
            var height = bottom - top;
            var ratio_width = width / this.Rectangle.Width;
            var ratio_height = height / this.Rectangle.Height;

            var ratio_size = this.MinimumScale( {Width:ratio_width, Height:ratio_height} );
            if(Transformation.Left && ratio_size.Width == 1)left = this.Rectangle.X;
            if(Transformation.Top && ratio_size.Height == 1)top = this.Rectangle.Y;
            if(Transformation.Left || Transformation.Top)
                this.MoveToScale(left, top);
            this.ScaleTo(ratio_size.Width, ratio_size.Height);
        }
        else
        {
            if(Transformation.Left || Transformation.Top)
                this.MoveTo(left, top);
            this.ResizeTo(right - left, bottom - top);
        }
    };
    this.ResizeTo = function(width, height)
    {
        this.Rectangle.Width = width;
        this.Rectangle.Height = height;

        if(this.ClipCanvas != null)
        {
            this.ClipCanvas.width = this.Rectangle.Width-this.Border.Left-this.Border.Right;
            this.ClipCanvas.height = this.Rectangle.Height-this.Border.Top-this.Border.Bottom;
        }

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentResize();
    
        this.Resized();
    };
    this.ParentResize = function(){};
    this.Resized = function(){};
    this.ResizeEnd = function(){};
    this.ScaleTo = function(ratio_width, ratio_height)
    {
        this.Rectangle.Width = this.Rectangle.Width * ratio_width;
        this.Rectangle.Height = this.Rectangle.Height * ratio_height;

        this.Border.Left = this.Border.Left * ratio_width;
        this.Border.Right = this.Border.Right * ratio_width;
        this.Border.Top = this.Border.Top * ratio_height;
        this.Border.Bottom = this.Border.Bottom * ratio_height;

        if(this.ClipCanvas != null)
        {
            this.ClipCanvas.width = this.Rectangle.Width-this.Border.Left-this.Border.Right;
            this.ClipCanvas.height = this.Rectangle.Height-this.Border.Top-this.Border.Bottom;
        }

        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                this.Controls[i].ParentScale(ratio_width, ratio_height);

        this.Scaled(ratio_width, ratio_height);
    };
    this.MoveToScale = function(x, y)
    {
        this.Location.X = this.Parent == null ? x : x - this.Parent.Rectangle.X-this.Parent.Border.Left;
        this.Location.Y = this.Parent == null ? y : y - this.Parent.Rectangle.Y-this.Parent.Border.Top;
        this.Rectangle.X = x;
        this.Rectangle.Y = y;
    };
    this.ParentScale = function(ratio_width, ratio_height)
    {
        this.MoveToScale(this.Parent.Rectangle.X+this.Parent.Border.Left+(this.Location.X*ratio_width), this.Parent.Rectangle.Y+this.Parent.Border.Top+(this.Location.Y*ratio_height) );
        this.ScaleTo(ratio_width, ratio_height);
    };
    this.Scaled = function(ratio_width, ratio_height){};
    this.ScaleEnd = function(){};
    this.MinimumScale = function(ratio_size)
    {
        if(this.ClipCanvas != null)
        {
            if( (this.Rectangle.Width-this.Border.Left-this.Border.Right) * ratio_size.Width < 2)ratio_size.Width = 1;
            if( (this.Rectangle.Height-this.Border.Top-this.Border.Bottom) * ratio_size.Height < 2)ratio_size.Height = 1;
        }
        if(this.CanResize && this.Rectangle.Width * ratio_size.Width < Transformation.Border*2)ratio_size.Width = 1;
        else if(this.Rectangle.Width * ratio_size.Width < 2)ratio_size.Width = 1;
        if(this.CanResize && this.Rectangle.Height * ratio_size.Height < Transformation.Border*2)ratio_size.Height = 1;
        else if(this.Rectangle.Height * ratio_size.Height < 2)ratio_size.Height = 1;
        if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
                ratio_size = this.Controls[i].MinimumScale(ratio_size);
        return ratio_size;
    };
    this.OnRectangleChanged = function( x, y, width, height )
    {
        this.MoveTo(x, y);
        this.ResizeTo(width, height);
    };

    this.OnMouseHover = function()
    {
        MouseHover.Selected = this;

        if(this.ClipCanvas == null || (Mouse.X >= this.Form.Position.X + this.Rectangle.X+this.Border.Left 
                && Mouse.X <= this.Form.Position.X + this.Right()-this.Border.Right 
                && Mouse.Y >= this.Form.Position.Y + this.Rectangle.Y+this.Border.Top 
                && Mouse.Y <= this.Form.Position.Y + this.Bottom()-this.Border.Bottom))
        {
            if( this.Controls != null )
            for(var i = 0; i < this.Controls.length; i++)
            {       
                if ( this.Controls[i].Enabled && this.Controls[i].ContainMouse() )
                {
                    this.Controls[i].OnMouseHover();
                    return;
                }
            }
        }
    };
    this.OnMouseEnter = function(){};//{if(this.Parent != null)this.Parent.OnMouseEnter();};
    this.OnMouseLeave = function(){};//{if(this.Parent != null)this.Parent.OnMouseLeave();};
    this.MouseMove = function (){};
    
    this.OnDrag = function(){};
    this.OnDragDraw = function(){};
    this.OnDrop = function(){};
    this.OnDragEnter = function(){};
    this.OnDragLeave = function(){};
    this.OnDragOver = function(){};
    
    this.ReadFileDropped = function(e){ if(this.Parent != null)this.Parent.ReadFileDropped(e); };
    
    this.OnMouseWheel = function(rolled){ if(this.Parent != null)this.Parent.OnMouseWheel(rolled); };
    this.ClickLeft = function(){};
    this.ClickLeftUp = function(){};
    this.ClickRight = function(){};
    this.ClickRightUp = function(){};
    this.OnKeyDown = function()
    {
        switch(Modifiers.Value)
        {
            case "Enter" :
                this.KeyEnter();
                break;
            case "Tab" :
                this.KeyTab();
                break;
            case "Space" :
                this.KeySpace();
                break;
            case "Backspace" :
                this.KeyBackspace();
                break;
            case "Delete" :
                this.KeyDelete();
                break;
            case "Esc" :
                this.KeyEsc();
                break;
            case "LeftArrow" :
                this.KeyLeftArrow();
                break;
            case "RightArrow" :
                this.KeyRightArrow();
                break;
            case "UpArrow" :
                this.KeyUpArrow();
                break;
            case "DownArrow" :
                this.KeyDownArrow();
                break;
        }
        this.KeyDown(Modifiers.Value);
    };
    this.KeyDown = function(){};

    this.KeyEnter = function(){ this.ClickLeft(); };
    this.KeyTab = function(){ if(this.Tab != null)this.Tab.OnFocus(); else if(this.Parent != null)this.Parent.KeyTab(); };
    this.KeySpace = function(){ if(this.Parent != null)this.Parent.KeySpace(); };
    this.KeyBackspace = function(){ if(this.Parent != null)this.Parent.KeyBackspace(); };
    this.KeyDelete = function(){ if(this.Parent != null)this.Parent.KeyDelete(); };
    this.KeyEsc = function(){ if(this.Parent != null)this.Parent.KeyEsc(); };
    this.KeyLeftArrow = function(){ if(this.Parent != null)this.Parent.KeyLeftArrow(); };
    this.KeyRightArrow = function(){ if(this.Parent != null)this.Parent.KeyRightArrow(); };
    this.KeyUpArrow = function(){ if(this.Parent != null)this.Parent.KeyUpArrow(); };
    this.KeyDownArrow = function(){ if(this.Parent != null)this.Parent.KeyDownArrow(); };

    this.Hide = function(){ this.Visible = false; this.Enabled = false; };
    this.Show = function(){ this.OnFocus(); this.Visible = true; this.Enabled = true; };

    this.ClipCanvas = null;
    this.ClipContext = null;
    this.OnClip = function()
    {
        this.ClipCanvas = document.createElement('canvas');
        this.ClipCanvas.style.display = 'none';
        document.body.appendChild(this.ClipCanvas);
        this.ClipContext = this.ClipCanvas.getContext("2d");
        this.ClipCanvas.width = this.Rectangle.Width-this.Border.Left-this.Border.Right;
        this.ClipCanvas.height = this.Rectangle.Height-this.Border.Top-this.Border.Bottom;
    };


    this.OnDraw = function(context, x, y)//context:CLipContext, x:Location.X+Border.Left, y:Location.Y+Border.Top
    {
        if(context == undefined)
            this.OnDrawing(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Form.Context);
        else
            this.OnDrawing(this.Rectangle.X-x, this.Rectangle.Y-y, this.Rectangle.Width, this.Rectangle.Height, context);
    
        Interface_Default(context);

        if(this.ClipContext != null)
        {
            if( this.Controls != null )
                for(var i = this.Controls.length; i >= 0 ; i--)
                    if ( this.Controls[i] != null && this.Controls[i].Visible )
                        this.Controls[i].OnDraw(this.ClipContext, this.Rectangle.X+this.Border.Left, this.Rectangle.Y+this.Border.Top);
        }
        else if(context != undefined)
        {
            if( this.Controls != null )
                for(var i = this.Controls.length; i >= 0 ; i--)
                    if ( this.Controls[i] != null && this.Controls[i].Visible )
                        this.Controls[i].OnDraw(context, x, y);
        }
        else
        {
            if( this.Controls != null )
                for(var i = this.Controls.length; i >= 0 ; i--)
                    if ( this.Controls[i] != null && this.Controls[i].Visible )
                        this.Controls[i].OnDraw(undefined, 0, 0);
        }

        if(context == undefined)
            this.DrawUp(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height, this.Form.Context);
        else
            this.DrawUp(this.Rectangle.X-x, this.Rectangle.Y-y, this.Rectangle.Width, this.Rectangle.Height, context);

        if(this.ClipContext != null)
        {
            if(context != undefined)
                context.drawImage(this.ClipCanvas, this.Rectangle.X+this.Border.Left-x, this.Rectangle.Y+this.Border.Top-y);
            else
                this.Form.Context.drawImage(this.ClipCanvas, this.Rectangle.X+this.Border.Left, this.Rectangle.Y+this.Border.Top);
            Interface_Default(this.ClipContext);
            this.ClipContext.clearRect(0, 0, this.Rectangle.Width-this.Border.Left-this.Border.Right, this.Rectangle.Height-this.Border.Top-this.Border.Bottom);
        }

    
        this.Form.Default();
    };
    this.OnDrawing = function(x, y, width, height, context)
    {
        if(Appearance != null)
        {
            switch(this.AppearanceType)
            {
                case "Form" : { this.Appearance = Appearance.Form; break; }
                case "Control" : { this.Appearance = Appearance.Control; break; }
                case "TextBox" : { this.Appearance = Appearance.TextBox; break; }
            }
        }
        if(this.Appearance != null)
        {
        
            var imgData_temp = null;
            if(this.BackTransparent)
                imgData_temp = context.getImageData(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);     
        
            if (MouseHover.Control == this )
            {
            
//                if(this.BackTransparent)
//                {
////                context.beginPath();
//context.fillStyle = "transparent";
//context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//context.globalCompositeOperation = "xor";
////context.fill();
////context.beginPath();
////context.fillStyle = "red";
////context.arc(50,50,35,0,2 * Math.PI,false);
////context.fill();
//////                    context.save();
////                    context.fillStyle="transparent";
//////                    context.beginPath();
////                    context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
////                    context.globalCompositeOperation = "destination-out";
//////                    context.globalCompositeOperation = "source-over";
//                }
            
                if(this.Appearance.BackColorOut_Hover != "")
                {
                    context.fillStyle = this.Appearance.BackColorOut_Hover;
                    context.fillRect(x, y, width, height);
                }
                if(this.Appearance.BackGroundImageOut_Hover != null)
                    DrawTemplateAppearance(this.Appearance.BackGroundImageOut_Hover, x, y, width, height, context, this);
                if( this.Appearance.BorderColorOut_Hover != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorOut_Hover;
                    context.strokeRect(x, y, width, height);
                }
                if(!this.BackTransparent)
                {
                    if(this.BackColor != "")
                    {
                        context.fillStyle = this.BackColor;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    else if(this.Appearance.BackColorIn_Hover != "")
                    {
                        context.fillStyle = this.Appearance.BackColorIn_Hover;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    if(this.BackGroundImage != null)
                        DrawTemplateImage(this.BackGroundImage, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context);
                    else if(this.Appearance.BackGroundImageIn_Hover != null)
                        DrawTemplateAppearance(this.Appearance.BackGroundImageIn_Hover, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context, this);
                }
//                else
//                {
//                    
////                    context.clearRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//                    context.globalCompositeOperation = "destination-out";
//                    context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//                    context.globalCompositeOperation = "source-over";
//                }
                if( this.Appearance.BorderColorIn_Hover != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorIn_Hover;
                    context.strokeRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                }
            }
            else if (Focus == this )
            {
                if(this.Appearance.BackColorOut_Focus != "")
                {
                    context.fillStyle = this.Appearance.BackColorOut_Focus;
                    context.fillRect(x, y, width, height);
                }
                if(this.Appearance.BackGroundImageOut_Focus != null)
                    DrawTemplateAppearance(this.Appearance.BackGroundImageOut_Focus, x, y, width, height, context, this);
                if( this.Appearance.BorderColorOut_Focus != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorOut_Focus;
                    context.strokeRect(x, y, width, height);
                }
                if(!this.BackTransparent)
                {
                    if(this.BackColor != "")
                    {
                        context.fillStyle = this.BackColor;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    else if(this.Appearance.BackColorIn_Focus != "")
                    {
                        context.fillStyle = this.Appearance.BackColorIn_Focus;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    if(this.BackGroundImage != null)
                        DrawTemplateImage(this.BackGroundImage, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context);
                    else if(this.Appearance.BackGroundImageIn_Focus != null)
                        DrawTemplateAppearance(this.Appearance.BackGroundImageIn_Focus, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context, this);
                }
//                else
//                {
//                    context.globalCompositeOperation = "destination-out";
//                    context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//                    context.globalCompositeOperation = "source-over";
//                }
                if( this.Appearance.BorderColorIn_Focus != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorIn_Focus;
                    context.strokeRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                }
            }
            else
            {
                if(this.Appearance.BackColorOut != "")
                {
//window.open = this.Canvas.toDataURL();
//context.fillStyle = "transparent";
//context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
////context.globalCompositeOperation = "destination-over";
////context.globalCompositeOperation = "destination-out";
//context.globalCompositeOperation = "xor";

//                    var imgData = context.getImageData(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//                    var imgData2 = context.createImageData(imgData);

                    context.fillStyle = this.Appearance.BackColorOut;
                    context.fillRect(x, y, width, height);

//                    context.putImageData(imgData2, x+this.Border.Left, y+this.Border.Top);

//                    context.globalCompositeOperation = "source-over";

                }
                if(this.Appearance.BackGroundImageOut != null)
                    DrawTemplateAppearance(this.Appearance.BackGroundImageOut, x, y, width, height, context, this);
                if( this.Appearance.BorderColorOut != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorOut;
                    context.strokeRect(x, y, width, height);
                }
                if(!this.BackTransparent)
                {
                    if(this.BackColor != "")
                    {
                        context.fillStyle = this.BackColor;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    else if(this.Appearance.BackColorIn != "")
                    {
                        context.fillStyle = this.Appearance.BackColorIn;
                        context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                    }
                    if(this.BackGroundImage != null)
                        DrawTemplateImage(this.BackGroundImage, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context);
                    else if(this.Appearance.BackGroundImageIn != null)
                        DrawTemplateAppearance(this.Appearance.BackGroundImageIn, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom, context, this);
                }
//                else
//                {
////                    context.save();
//                    context.globalCompositeOperation = "xor";//"destination-out";
//                    context.fillRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
//                    context.globalCompositeOperation = "source-over";
////                    context.restore();
//                }
                if( this.Appearance.BorderColorIn != "" )
                {
                    context.strokeStyle = this.Appearance.BorderColorIn;
                    context.strokeRect(x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
                }
//                context.closePath();
//                    context.globalCompositeOperation = "source-over";
//                context.restore();
//context.fill();
//                context.closePath();
//                context.restore();



            }

            if(imgData_temp != null)
                context.putImageData(imgData_temp, x+this.Border.Left, y+this.Border.Top);
            Interface_Default(context);

            switch(this.AppearanceType)
            {
                case "Form" : { DrawForm(x, y, width, height, context, this); break; }
                case "Control" : { DrawControl(x, y, width, height, context, this); break; }
                case "TextBox" : { DrawTextBox(x, y, width, height, context, this); break; }
            }
        }

        Interface_Default(context);

        this.Draw(x, y, width, height, context);
    };
    this.Draw = function(x, y, width, height, context){};
    this.DrawUp = function(x, y, width, height, context){};
};

var DrawTemplateAppearance = function(imagejson, x, y, width, height, context, control)
{
    if(imagejson == null) return;
    var template = null;
    
    for( var i = 0; i < Appearance.Templates.length; i++)
        if(Appearance.Templates[i].Name == imagejson.Name )
            template = Appearance.Templates[i];

    if(template == null || template.Image == null) return;
    if(context == null || context == undefined)return;

    var tW = template.Image.width / template.NbrX;
    var tH = template.Image.height / template.NbrY;
    var tX = (imagejson.NbrX-1) * tW;
    var tY = (imagejson.NbrY-1) * tH;

    context.drawImage(template.Image, tX, tY, tW, tH, x, y, width, height );
};

//TEMPORAIRE!!!!!!!!!!!!!!!!!!!!!!!!!!!!
var numberOfLines = 5;
var nbrdraw = 0;
var FunctionDraw = function(x, y, width, height, context)
{
    if(this.Controls == null )
    {
        var gradient = context.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0,"black");
        if (MouseHover.Control == this )
            gradient.addColorStop(0.5,"green");
        else if (Focus == this )
            gradient.addColorStop(0.5,"red");
        else
            gradient.addColorStop(0.5,"blue");
        gradient.addColorStop(1,"white")
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);

        context.fillStyle = "white";
        if(this.Text != null)
        {
            var txt = Translate(this.Text);
            context.fillText(MeasureText(txt, width, context), x, y+15);
        }
    }
    else
    {
        for(var j=0; j<numberOfLines; ++j)
        {
            var offset = (nbrdraw+j*10)/20;
            context.lineWidth = 1+2*(numberOfLines-j);
            context.strokeStyle = 'rgba(80,150,240,'+(j/5+0.1)+')';
            var py = (Math.sin(offset)+1)*height/2;
            var cpy1 = (Math.cos(offset)+0.5)*height;
            var cpy2 = height - cpy1;
            context.beginPath();
            context.moveTo(x, y+py);
            context.bezierCurveTo(x +(width/3), y + cpy1, x +(2*width/3), y+cpy2, x+width, y + py);
            context.stroke();
        }
        nbrdraw++;
    }
};

var FunctionDraw2 = function(x, y, width, height, context)
{
    if(this.Controls == null )
    {
        var gradient = context.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0,"black");
        if (MouseHover.Control == this )
            gradient.addColorStop(0.5,"green");
//        else if (Focus == this )
//            gradient.addColorStop(0.5,"red");
        else
            gradient.addColorStop(0.5,"rgba(0, 0, 0, 0)");//"rgba(255, 0, 0, 0.2)"
        gradient.addColorStop(1,"white")
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);

        context.fillStyle = "white";
        if(this.Text != null)
        {
            var txt = Translate(this.Text);
            context.fillText(MeasureText(txt, width, context), x, y+15);
        }
        context.strokeStyle = "white";
        if (Focus == this)context.strokeRect(x, y, width, height);
    }
    else
    {
        for(var j=0; j<numberOfLines; ++j)
        {
            var offset = (nbrdraw+j*10)/20;
            context.lineWidth = 1+2*(numberOfLines-j);
            context.strokeStyle = 'rgba(80,150,240,'+(j/5+0.1)+')';
            var py = (Math.sin(offset)+1)*height/2;
            var cpy1 = (Math.cos(offset)+0.5)*height;
            var cpy2 = height - cpy1;
            context.beginPath();
            context.moveTo(x, y+py);
            context.bezierCurveTo(x +(width/3), y + cpy1, x +(2*width/3), y+cpy2, x+width, y + py);
            context.stroke();
        }
        nbrdraw++;
    }
};



var DrawForm = function(x, y, width, height, context, control){};
var DrawTextBox = function(x, y, width, height, context, control){};
var DrawControl = function(x, y, width, height, context, control)
{
    if(control.Controls == null)
    {
        var gradient = context.createLinearGradient(x, y, x + width, y);
        gradient.addColorStop(0,"black");
        gradient.addColorStop(0.4,"rgba(0, 0, 0, 0)");
        gradient.addColorStop(0.6,"rgba(0, 0, 0, 0)");
        gradient.addColorStop(1,"white")
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);

        context.fillStyle = "white";
        if(control.Text != null)
        {
            var txt = Translate(control.Text);
            context.fillText(MeasureText(txt, width, context), x, y+15);
        }
        context.strokeStyle = "white";
        if (Focus == control)context.strokeRect(x, y, width, height);
    }
//    else
//    {
//        for(var j=0; j<numberOfLines; ++j)
//        {
//            var offset = (nbrdraw+j*10)/20;
//            context.lineWidth = 1+2*(numberOfLines-j);
//            context.strokeStyle = 'rgba(80,150,240,'+(j/5+0.1)+')';
//            var py = (Math.sin(offset)+1)*height/2;
//            var cpy1 = (Math.cos(offset)+0.5)*height;
//            var cpy2 = height - cpy1;
//            context.beginPath();
//            context.moveTo(x, y+py);
//            context.bezierCurveTo(x +(width/3), y + cpy1, x +(2*width/3), y+cpy2, x+width, y + py);
//            context.stroke();
//        }
//        nbrdraw++;
//    }
};
var DrawButton = function(x, y, width, height, context, control){};
















































//###################################################//
//##################### Control #####################//
//###################################################//

//function Button(x, y, width, height)
//{
//    this.InheritClass = InheritObject;
//    this.InheritClass();
//    delete this.InheritClass;
//    this.Inherit("Button");
//    
//    this.AppearanceType = "Button";
//};

function ControlSlider(x, y, width, height, border)
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height, border );
    delete this.InheritClass;
    this.Inherit("ControlSlider");

    this.CanScale = true;

    this.Step = 1;
    this.MinValue = 0;
    this.MaxValue = 100;
    this.BarHeight = 5;
    
var cx = 0;
var cy = 0;
var cw = height-this.Border.Top-this.Border.Bottom;
var ch = height-this.Border.Top-this.Border.Bottom;
var es = 5;
    this.Btn_Cursor = new Control(cx, cy, cw, ch);
    this.Btn_Cursor.ClickLeft = function(){this.OnTransformation();};
    this.Btn_Cursor.ClickLeftUp = function(){Control_OnClear();};
    this.Btn_Cursor.CanMove = true;
    this.Btn_Cursor.Moved = function(){if(Transformation.Control == this && this.Parent != null)this.Parent.SliderMove();};
    this.Add(this.Btn_Cursor);

    this.ClickLeft = function()
    {
        Transformation.Control = this.Btn_Cursor;
        this.Btn_Cursor.OnMove();
    };
//    this.Resized = function()
//    {
//        this.Btn_Cursor.ResizeTo(this.Rectangle.Height-this.Border.Top-this.Border.Bottom,this.Rectangle.Height-this.Border.Top-this.Border.Bottom);
//    };
    this.CurrentPurcentValue = function()
    {
        var max = this.Rectangle.Width-this.Border.Left-this.Border.Right-this.Btn_Cursor.Rectangle.Width;
        var num = this.Btn_Cursor.Location.X;
        return num/max;
    };
    this.CurrentValue = function()
    {
        var num = Math.floor( (this.MaxValue-this.MinValue) * this.CurrentPurcentValue() );
        var n = num % this.Step;
        return this.MinValue + num - n;
    };
    this.SetValue = function(ratio)
    {
        var btn_X = this.Rectangle.X + ((this.Rectangle.Width-this.Border.Left-this.Border.Right-this.Btn_Cursor.Rectangle.Width)*ratio);
        this.Btn_Cursor.MoveToIn(btn_X, this.Btn_Cursor.Rectangle.Y);
        this.SliderMove();
    };
    this.SliderMove = function(){};
    this.Draw = function(x, y, width, height, context)
    {
        context.fillRect(x+this.Border.Left, y + (height/2)-(this.BarHeight/2), width-this.Border.Left-this.Border.Right, this.BarHeight);
    };
};

function ControlSlider_Vertical(x, y, width, height)
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlSlider_Vertical");

    this.Step = 1;
    this.MinValue = 0;
    this.MaxValue = 100;
    this.BarWidth = 5;
    
var cx = 0;
var cy = 0;
var cw = width-this.Border.Left-this.Border.Right;
var ch = width-this.Border.Left-this.Border.Right;
var es = 5;
    this.Btn_Cursor = new Control(cx, cy, cw, ch);
    this.Btn_Cursor.ClickLeft = function(){this.OnTransformation();};
    this.Btn_Cursor.ClickLeftUp = function(){Control_OnClear();};
    this.Btn_Cursor.CanMove = true;
    this.Btn_Cursor.Moved = function(){if(Transformation.Control == this && this.Parent != null)this.Parent.SliderMove();};
    this.Add(this.Btn_Cursor);

    this.ClickLeft = function()
    {
        Transformation.Control = this.Btn_Cursor;
        this.Btn_Cursor.OnMove();
    };
    this.CurrentPurcentValue = function()
    {
        var max = this.Rectangle.Height-this.Border.Top-this.Border.Bottom-this.Btn_Cursor.Rectangle.Height;
        var num = max - this.Btn_Cursor.Location.Y;
        return num/max;
    };
    this.CurrentValue = function()
    {
        var num = Math.floor( (this.MaxValue-this.MinValue) * this.CurrentPurcentValue() );
        var n = num % this.Step;
        return this.MinValue + num - n;
    };
    this.SetValue = function(ratio)
    {
        var max = this.Rectangle.Height-this.Border.Top-this.Border.Bottom-this.Btn_Cursor.Rectangle.Height;
        var btn_Y = this.Rectangle.Y+this.Border.Top + (max-(max*ratio));
//        var btn_Y = this.Rectangle.Y + ((this.Rectangle.Height-this.Border.Top-this.Border.Bottom-this.Btn_Cursor.Rectangle.Height)*ratio);
        this.Btn_Cursor.MoveToIn( this.Btn_Cursor.Rectangle.X, btn_Y);
        this.SliderMove();
    };
    this.SliderMove = function(){};
    this.Draw = function(x, y, width, height, context)
    {
        context.fillRect(x + (width/2)-(this.BarWidth/2), y+this.Border.Top, this.BarWidth, height-this.Border.Top-this.Border.Bottom);
    };
};

//function ControlSlider_Vertical(x, y, width, height)
//{
//    this.InheritClass = Control;
//    this.InheritClass( x, y, width, height );
//    delete this.InheritClass;
//    this.Inherit("ControlSlider_Vertical");

//    this.Step = 1;
//    this.MinValue = 0;
//    this.MaxValue = 100;
//    this.BarWidth = 5;
//    
//var cx = 0;
//var cy = 0;
//var cw = width-this.Border.Left-this.Border.Right;
//var ch = width-this.Border.Left-this.Border.Right;
//var es = 5;
//    this.Btn_Cursor = new Control(cx, cy, cw, ch);
//    this.Btn_Cursor.ClickLeft = function(){this.OnTransformation();};
//    this.Btn_Cursor.ClickLeftUp = function(){Control_OnClear();};
//    this.Btn_Cursor.CanMove = true;
//    this.Btn_Cursor.Moved = function(){if(Transformation.Control == this && this.Parent != null)this.Parent.SliderMove();};
//    this.Add(this.Btn_Cursor);

//    this.ClickLeft = function()
//    {
//        Transformation.Control = this.Btn_Cursor;
//        this.Btn_Cursor.OnMove();
//    };
//    this.CurrentPurcentValue = function()
//    {
////        var max = this.Rectangle.Width-this.Border.Left-this.Border.Right-this.Btn_Cursor.Rectangle.Width;
////        var num = this.Btn_Cursor.Location.X;
//        var max = this.Rectangle.Height-this.Border.Top-this.Border.Bottom-this.Btn_Cursor.Rectangle.Height;
//        var num = this.Btn_Cursor.Location.Y;
//        return num/max;
//    };
//    this.CurrentValue = function()
//    {
//        var num = Math.floor( (this.MaxValue-this.MinValue) * this.CurrentPurcentValue() );
//        var n = num % this.Step;
//        return this.MinValue + num - n;
//    };
//    this.SetValue = function(ratio)
//    {
////        var btn_X = this.Rectangle.X + ((this.Rectangle.Width-this.Border.Left-this.Border.Right-this.Btn_Cursor.Rectangle.Width)*ratio);
////        this.Btn_Cursor.MoveToIn(btn_X, this.Btn_Cursor.Rectangle.Y);
//        var btn_Y = this.Rectangle.Y + ((this.Rectangle.Height-this.Border.Top-this.Border.Bottom-this.Btn_Cursor.Rectangle.Height)*ratio);
//        this.Btn_Cursor.MoveToIn( this.Btn_Cursor.Rectangle.X, btn_Y);
//        this.SliderMove();
//    };
//    this.SliderMove = function(){};
//    this.Draw = function(x, y, width, height, context)
//    {
//        context.fillRect(x + (width/2)-(this.BarWidth/2), y+this.Border.Top, this.BarWidth, height-this.Border.Top-this.Border.Bottom);
////        context.fillRect(x+this.Border.Left, y + (height/2)-(this.BarHeight/2), width-this.Border.Left-this.Border.Right, this.BarHeight);
//    };
//};


function ControlCollection(x, y, width, height, border)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, border);
    delete this.InheritClass;
    this.Inherit("ControlCollection");

//    this.Border = { Left:10, Top:10, Right:10, Bottom:10 };
//    this.BackColor = "grey";

    this.Controls = new Array();

    this.OnClip();

    this.ListIndex = 0;
    this.MinIndex = 0;
    this.OriginalHeight = height;
    this.Minimize = false;
    this.Maximize = false;
    this.Collection = new Array();

    this.AddCollection = function(control)
    {
        this.Collection[this.Collection.length] = control;
        this.OnCollection();
    };
    this.Clear = function()
    {
        this.Collection = new Array();
        this.Controls = new Array();
        this.ListIndex = 0;
        this.MinIndex = 0;  
    };

    this.OnCollection = function(maximize)
    {
        this.Controls = new Array();
        if(maximize != null && maximize != undefined)
            this.Maximize = maximize;
        var pY = this.ListIndex;
        var pH = 0;
        if(this.Maximize) pY = 0;

        for(var i = 0; i < this.Collection.length; i++)
        {
            if(!this.Collection[i].Visible)continue;
            this.Collection[i].Location.Y = pY;
            this.Add(this.Collection[i]);
            pY += this.Collection[i].Rectangle.Height;
            pH += this.Collection[i].Rectangle.Height;
        }

        if(!this.Minimize && this.OriginalHeight > pH+this.Border.Top+this.Border.Bottom)
            this.ResizeTo(this.Rectangle.Width, this.OriginalHeight);
        else if(pH != 0 && this.Maximize)
            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
        else if(pH != 0 && this.OriginalHeight > pH+this.Border.Top+this.Border.Bottom)
            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
        else
            this.ResizeTo(this.Rectangle.Width, this.OriginalHeight);

        if(pH > this.Rectangle.Height-this.Border.Top-this.Border.Bottom)
            this.MinIndex = 0-pH+this.Rectangle.Height-this.Border.Top-this.Border.Bottom;
        else
            this.MinIndex = 0;
        
        if(this.ListIndex > 0){ this.ListIndex = 0; this.OnRolled(); }
        if(this.ListIndex < this.MinIndex){ this.ListIndex = this.MinIndex; this.OnRolled(); }
    };
    this.OnRolled = function()
    {
        var pY = 0;
        if( this.Collection != null && this.Collection.length > 0 )
            for(var i = 0; i < this.Collection.length; i++)
            {
                if(!this.Collection[i].Visible)continue;
                this.Collection[i].MoveTo( this.Collection[i].Rectangle.X, this.Rectangle.Y+this.Border.Top+pY+this.ListIndex ); 
                pY += this.Collection[i].Rectangle.Height;
            }
    };
    this.OnMouseWheel = function(rolled)
    {
        if(rolled > 0)rolled = 5;// 1;
        else rolled = -5;// -1;
        
        if(this.Collection == null || this.Collection.length == 0)return;

        if( (this.ListIndex == 0 && this.ListIndex+rolled > 0) || (this.ListIndex == this.MinIndex && this.ListIndex+rolled < this.MinIndex) )
        {
            if(this.Parent != null)this.Parent.OnMouseWheel(rolled);
        }
        else
        {
            this.ListIndex += rolled;
            if(this.ListIndex+rolled > 0) this.ListIndex = 0;
            if(this.ListIndex+rolled < this.MinIndex) this.ListIndex = this.MinIndex;
            this.OnRolled();
        }
    };

    this.KeyUpArrow = function(){ this.OnMouseWheel(10); };
    this.KeyDownArrow = function(){ this.OnMouseWheel(-10); };

//    this.Draw = function(x, y, width, height, context){};
};

//Ajouter this.Minimize cf ControlCollection
function ControlCollection_Horizontal(x, y, width, height)
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlCollection_Horizontal");

//    this.Border = { Left:10, Top:10, Right:10, Bottom:10 };
//    this.BackColor = "grey";

    this.Controls = new Array();

    this.OnClip();

    this.ListIndex = 0;
    this.MinIndex = 0;
    this.OriginalWidth = width;
//    this.OriginalHeight = height;
    this.Maximize = false;
    this.Collection = new Array();

    this.AddCollection = function(control)
    {
        this.Collection[this.Collection.length] = control;
        this.OnCollection();
    };
    this.Clear = function()
    {
        this.Collection = new Array();
        this.Controls = new Array();
        this.ListIndex = 0;
        this.MinIndex = 0;  
    };

    this.OnCollection = function(maximize)
    {
        this.Controls = new Array();
        if(maximize != null && maximize != undefined)
            this.Maximize = maximize;
        var pX = this.ListIndex;
        var pW = 0;
//        var pY = this.ListIndex;
//        var pH = 0;
        if(this.Maximize) pX = 0;

        for(var i = 0; i < this.Collection.length; i++)
        {
            if(!this.Collection[i].Visible)continue;
            this.Collection[i].Location.X = pX;
            this.Add(this.Collection[i]);
            pX += this.Collection[i].Rectangle.Width;//.Height;
            pW += this.Collection[i].Rectangle.Width;//.Height;
        }

        if(pW != 0 && this.Maximize)
            this.ResizeTo(pW+this.Border.Left+this.Border.Right, this.Rectangle.Height);// pH+this.Border.Top+this.Border.Bottom);
        else if(pW != 0 && this.OriginalWidth > pW+this.Border.Left+this.Border.Right)//pH+this.Border.Top+this.Border.Bottom)
            this.ResizeTo(pW+this.Border.Left+this.Border.Right, this.Rectangle.Height);//pH+this.Border.Top+this.Border.Bottom);
        else
            this.ResizeTo(this.OriginalWidth, this.Rectangle.Height);//this.OriginalHeight);
//        if(pW != 0 && this.Maximize)
//            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
//        else if(pH != 0 && this.OriginalHeight > pH+this.Border.Top+this.Border.Bottom)
//            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
//        else
//            this.ResizeTo(this.Rectangle.Width, this.OriginalHeight);

        this.MinIndex = 0-pW+this.Rectangle.Width-this.Border.Left-this.Border.Right;
//        this.MinIndex = 0-pH+this.Rectangle.Height-this.Border.Top-this.Border.Bottom;

        if(this.ListIndex > 0){ this.ListIndex = 0; this.OnRolled(); }
        if(this.ListIndex < this.MinIndex){ this.ListIndex = this.MinIndex; this.OnRolled(); }
    };
    this.OnRolled = function()
    {
        var pX = 0;
        if( this.Collection != null && this.Collection.length > 0 )
            for(var i = 0; i < this.Collection.length; i++)
            {
                if(!this.Collection[i].Visible)continue;
                this.Collection[i].MoveTo( this.Rectangle.X+this.Border.Left+pX+this.ListIndex, this.Collection[i].Rectangle.Y ); 
//                this.Collection[i].MoveTo( this.Collection[i].Rectangle.X, this.Rectangle.Y+this.Border.Top+pY+this.ListIndex ); 
                pX += this.Collection[i].Rectangle.Width;
            }
    };
    this.OnMouseWheel = function(rolled)
    {
        if(rolled > 0)rolled = 5;// 1;
        else rolled = -5;// -1;
        
        if(this.Collection == null || this.Collection.length == 0)return;

        if( (this.ListIndex == 0 && this.ListIndex+rolled > 0) || (this.ListIndex == this.MinIndex && this.ListIndex+rolled < this.MinIndex) )
        {
            if(this.Parent != null)this.Parent.OnMouseWheel(rolled);
        }
        else
        {
            this.ListIndex += rolled;
            if(this.ListIndex+rolled > 0) this.ListIndex = 0;
            if(this.ListIndex+rolled < this.MinIndex) this.ListIndex = this.MinIndex;
            this.OnRolled();
        }
    };

    this.KeyUpArrow = function(){ this.OnMouseWheel(10); };
    this.KeyDownArrow = function(){ this.OnMouseWheel(-10); };

    this.Draw = function(x, y, width, height, context){};
};












function ControlGame(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlGame");
    
    this.BackColor = "white";
    this.Text = "ControlGame";
    this.CanMove = true;
    this.Controls = [];

    this.Add(new ControlClose());

    this.Draw = function(x, y, width, height, context)
    {
        var px = x +10;
        var py = y +25;
        var es = 15;
        if(PageInfo.World == null)
        context.fillText("World : Aucun", px, py );
        else
        context.fillText("World : "+ PageInfo.World.Name, px, py );
        py += es;
        if(PageInfo.Map == null)
        context.fillText("Map : Aucune", px, py );
        else
        context.fillText("Map : "+ PageInfo.Map.Name +" ("+ PageInfo.Map.Width +"."+ PageInfo.Map.Height +"."+ PageInfo.Map.Depth +")", px, py );
        py += es;
        context.fillText("Size Cube : "+ PageInfo.MapInfo.SizeCube, px, py );
        py += es;
        context.fillText("Mouse : "+ Mouse.X +" : "+ Mouse.Y, px, py );
        py += es;
        context.fillText("Mouse Click Time : "+ Mouse.Time, px, py );
        py += es;
        context.fillText("Case : "+ Case.X +" : "+ Case.Y, px, py );
        py += es;
        context.fillText("Case Adjustment: "+ Case.Adjustment.X +" : "+ Case.Adjustment.Y, px, py );
        py += es;
        context.fillText("Grap : "+ Grap.X +" : "+ Grap.Y, px, py );
        py += es;
        context.fillText("Grap Adjustment: "+ Grap.Adjustment.X +" : "+ Grap.Adjustment.Y, px, py );
//        py += es;
//        context.fillText("Adjustement Map: "+ Adjustment.X +" : "+ Adjustment.Y, px, py );
//        py += es;
//        context.fillText("Adjustement Modify : "+ Adjustment.Modify.X +" : "+ Adjustment.Modify.Y, px, py );
        py += es;
        context.fillText("Location : "+ Location.X +"."+ Location.Y +"."+ Location.Z, px, py );
        py += es;
        context.fillText("KeyCode : "+ Modifiers.Value +" ("+ Modifiers.Keycode +")", px, py );
        
        py += 5;   
        if(Modifiers.Shift) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px, py, 20, 20);
        if(Modifiers.Ctrl) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+30, py, 20, 20);
        if(Modifiers.Alt) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+60, py, 20, 20);
        if(Modifiers.Meta) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+90, py, 20, 20);
        if(Modifiers.Capslock) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+120, py, 20, 20);        
        py += 20;
        Interface_Default(context);
 
//        if( Selected.ID != "")
//        {
//            var entity = Selected_Entity();
//            var entitydraw = null;
//            if(entity != null)
//            {
//            for(var e = 0; e < EntitysDraw.length; e++)
//                if( entity.ID == EntitysDraw[e].ID )
//                    entitydraw = EntitysDraw[e];
//            
//                py += es;
//                context.fillText("Entity : " + entity.Name +" ["+ entity.ID +"] ("+ entity.X +"."+ entity.Y +"."+ entity.Z +")", px, py );
//                if(entitydraw != null)
//                {
//                    py += es;
//                    context.fillText("Move : " + entitydraw.Move.ID +" ("+ entitydraw.Move.Step +")", px, py );
//                    if(entity.Move != null)
//                    {
//                        py += es;
//                        context.fillText("Move : " + entity.Move.ID +" ("+ entity.Move.Step +")", px, py );
//                    }
//                }
//            }
//        }
//        py += es;
        context.fillText("Selected Entity : " + Selected.ID, px, py );
        py += es;
        context.fillText("Selected Target : " + Selected.Target, px, py );
        py += es;
        context.fillText("Target ID: " + Target.ID, px, py );
        py += es;
        if(Target.Cube == null)
            context.fillText("Target Cube : NULL", px, py );
        else
            context.fillText("Target Cube : " + Target.Cube.X +"."+ Target.Cube.Y +"."+ Target.Cube.Z, px, py );
        py += es;
        if(Target.Case == null)
            context.fillText("Target Case : NULL", px, py );
        else
            context.fillText("Target Case : " + Target.Case.X +"."+ Target.Case.Y, px, py );
//        py += es;
//        context.fillText("Target X Y Z : " + Target.X +"."+ Target.Y +"."+ Target.Z, px, py );
//        py += es;
//        context.fillText("Target Adjustement : " + Target.Adjustment.X +"."+ Target.Adjustment.Y, px, py );
        py += es;
        context.fillText("Selected Mouse : " + SelectedMouse.Target, px, py );
        py += es;
        context.fillText("Selected Mouse X Y Z : " + SelectedMouse.X +"."+ SelectedMouse.Y +"."+ SelectedMouse.Z, px, py );
        py += es;
        if(Focus == null) context.fillText("Focus : NULL", px, py );
        else context.fillText("Focus : "+ Focus.Text, px, py );
        py += es;
        if(MouseHover.Control == null) context.fillText("MouseHover : NULL", px, py );
        else context.fillText("MouseHover : "+ MouseHover.Control.Text, px, py );
        
        py += es;
        context.fillText("Time : " + DrawTime, px, py );
        py += es;
        if(PageInfo.Map == null)
        context.fillText("Permanents : Aucun", px, py );
        else
        context.fillText("Permanents : " + PageInfo.Map.Permanents.length, px, py );
        py += es;
        context.fillText("Entitys : " + Entitys.length, px, py );
        py += es;
//        if(PageInfo.World != null)
        context.fillText("Translators : " + PageInfo.Translators.length, px, py );
        py += es;
        context.fillText("Animations : " + PageInfo.Animations.length, px, py );
        py += es;
        context.fillText("Templates : " + PageInfo.Templates.length, px, py );
        py += es;
        context.fillText("PlayAnimations : " + PlayAnimations.length, px, py );
        py += es;
        if(PageInfo.Map == null)
        context.fillText("NoCeiling : Aucun", px, py );
        else
        context.fillText("NoCeiling : " + PageInfo.Map.NoCeiling.length, px, py );
        
    };
};
function ControlInfo2(x, y, width, height, border )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, border );
    delete this.InheritClass;
    this.Inherit("ControlInfo2");
    
//    this.BackColor = "white";
    this.Text = "ControlGame";
    this.CanMove = true;
    this.Controls = [];

    this.Draw = function(x, y, width, height, context)
    {
        var px = x +10;
        var py = y +25;
        var es = 15;

        context.fillText("Mouse : "+ Mouse.X +" : "+ Mouse.Y, px, py );
        py += es;
        context.fillText("Mouse Time : "+ Mouse.Time, px, py );
        py += es;
        if(MouseHover.Control == null || MouseHover.Control.Form == null) context.fillText("Mouse Form : NULL", px, py );
        else context.fillText("Mouse Form : "+ (Mouse.X - MouseHover.Control.Form.Position.X) +" : "+ (Mouse.Y - MouseHover.Control.Form.Position.Y), px, py );
        py += es;
        context.fillText("KeyCode : "+ Modifiers.Value +" ("+ Modifiers.Keycode +")", px, py );
        
        py += 5;   
        if(Modifiers.Shift) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px, py, 20, 20);
        if(Modifiers.Ctrl) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+30, py, 20, 20);
        if(Modifiers.Alt) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+60, py, 20, 20);
        if(Modifiers.Meta) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+90, py, 20, 20);
        if(Modifiers.Capslock) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+120, py, 20, 20);        
        py += 20;
        Interface_Default(context);
        py += es;
        if(MouseHover.Control == null) context.fillText("MouseHover : NULL", px, py );
        else context.fillText("MouseHover : "+ MouseHover.Control.InheritType[MouseHover.Control.InheritType.length-1] +" : "+ MouseHover.Control.Text, px, py );

        py += es;
        py += es;
        if(Transformation.Control ==  null)
            context.fillText("Transformation : Aucun", px, py );
        else 
            context.fillText("Transformation : " + Transformation.Control.InheritType[Transformation.Control.InheritType.length-1], px, py );
        py += es;
            context.fillText("Transformation : " +Transformation.X +" . "+ Transformation.Y +" Border : "+Transformation.Border, px, py );
        py += es;
        if(Transformation.Resize) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Resize", px, py );
        py += es;
        if(Transformation.Left) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Left", px, py );
        py += es;
        if(Transformation.Top) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Top", px, py );
        py += es;
        if(Transformation.Right) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Right", px, py );
        py += es;
        if(Transformation.Bottom) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Bottom", px, py );
        py += es;
        if(Transformation.Lock) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillText("Transformation : Lock", px, py );

        context.fillStyle = "black";
        py += es;
        py += es;
        context.fillText("Time : " + DrawTime, px, py );
        py += es;
        context.fillText("Translators : " + PageInfo.Translators.length, px, py );
        py += es;
        context.fillText("Animations : " + PageInfo.Animations.length, px, py );
        py += es;
        context.fillText("Templates : " + PageInfo.Templates.length, px, py );
        py += es;
        context.fillText("PlayAnimations : " + PlayAnimations.length, px, py );
    };
};

function ControlDownload(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlDownload");
    
    this.BackColor = "white";
    this.Text = "ControlDownload";
    this.CanMove = true;

    this.Add(new ControlClose());

    this.Draw = function(x, y, width, height, context)
    {
        var px = x +10;
        var py = y +25;
        var es = 25;
        context.fillText("End : " +Download.End, px, py );
        py += es;
        context.fillText("Statut : " +Download.Statut, px, py );
        py += es;
        context.fillText("PageInfo : " +Download.PageInfo.End, px, py );
        py += es;
        context.fillText(" - Translators : " +Download.PageInfo.Translators.Nbr +"/"+ Download.PageInfo.Translators.Total, px, py );
        py += es;
        context.fillText(" - Animations : " +Download.PageInfo.Animations.Nbr +"/"+ Download.PageInfo.Animations.Total, px, py );
        py += es;
        context.fillText(" - Templates : " +Download.PageInfo.Templates.Nbr +"/"+ Download.PageInfo.Templates.Total, px, py );
        py += es;
        context.fillText("World : " +Download.World.End, px, py );
        py += es;
        context.fillText(" - Translators : " +Download.World.Translators.Nbr +"/"+ Download.World.Translators.Total, px, py );
        py += es;
        context.fillText(" - Animations : " +Download.World.Animations.Nbr +"/"+ Download.World.Animations.Total, px, py );
        py += es;
        context.fillText(" - Templates : " +Download.World.Templates.Nbr +"/"+ Download.World.Templates.Total, px, py );
        py += es;
        context.fillText("Map : " +Download.Map.End, px, py );
        py += es;
        context.fillText(" - Cubes : " +Download.Map.Cubes.Nbr +"/"+ Download.Map.Cubes.Total, px, py );
        py += es;
        context.fillText(" - Permanents : " +Download.Map.Permanents.Nbr +"/"+ Download.Map.Permanents.Total, px, py );
        py += es;
    };
};

function ControlInfo(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlInfo");
    
    this.BackColor = "white";
//    this.Text = "ControlGame";
    this.CanMove = true;

var cX = 0;
var cY = 0;
var cW = width-this.Border.Right-this.Border.Left;
var cH = 15;
var es = 5;

    this.List_Button = new ControlCollection(cX, cY, 100, height-this.Border.Top-this.Border.Bottom);
    this.Add(this.List_Button);
cX += 100+es;
    this.List_Info = new ControlCollection(cX, cY, cW-100-es, height-this.Border.Top-this.Border.Bottom);
    this.Add(this.List_Info);

var cW_btn = this.List_Button.Rectangle.Width-this.List_Button.Border.Left-this.List_Button.Border.Right;
var cW_info = this.List_Info.Rectangle.Width-this.List_Info.Border.Left-this.List_Info.Border.Right;

    this.Btn_Base = new ControlOnOff(0,0,cW_btn,cH);
    this.Btn_Base.SetText("#Base");
    this.Btn_Base.OnOffChanged = function(){ if(this.OnOff)this.Parent.Parent.Info_PageBase.Show(); else this.Parent.Parent.Info_PageBase.Hide(); this.Parent.Parent.List_Info.OnCollection(false); };
    this.List_Button.AddCollection(this.Btn_Base);

    this.Info_PageBase = new ControlInfo_PageBase(0,0,cW_info,200);
    this.List_Info.AddCollection(this.Info_PageBase);
    this.Info_PageBase.Hide();

    this.Btn_World = new ControlOnOff(0,0,cW_btn,cH);
    this.Btn_World.SetText("#Map");
    this.Btn_World.OnOffChanged = function(){ if(this.OnOff)this.Parent.Parent.Info_PageMap.Show(); else this.Parent.Parent.Info_PageMap.Hide(); this.Parent.Parent.List_Info.OnCollection(false); };
    this.List_Button.AddCollection(this.Btn_World);

    this.Info_PageMap = new ControlInfo_PageMap(0,0,cW_info,325);
    this.List_Info.AddCollection(this.Info_PageMap);
    this.Info_PageMap.Hide();


    


this.List_Button.OnCollection(false);
this.List_Info.OnCollection(false);

};



function ControlInfo_PageBase(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlInfo_PageBase");
    
    this.BackColor = "white";
    this.Text = "PageBase";

    this.Draw = function(x, y, width, height, context)
    {
        var px = x +10;
        var py = y +25;
        var es = 15;

        context.fillText("Mouse : "+ Mouse.X +" : "+ Mouse.Y, px, py );
        py += es;
        context.fillText("Mouse Click Time : "+ Mouse.Time, px, py );
        py += es;
        context.fillText("KeyCode : "+ Modifiers.Value +" ("+ Modifiers.Keycode +")", px, py );

        py += es;   
        if(Modifiers.Shift) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px, py, 20, 20);
        if(Modifiers.Ctrl) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+30, py, 20, 20);
        if(Modifiers.Alt) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+60, py, 20, 20);
        if(Modifiers.Meta) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+90, py, 20, 20);
        if(Modifiers.Capslock) context.fillStyle = "green"; else context.fillStyle = "red";
        context.fillRect(px+120, py, 20, 20);        
        py += 20;
        Interface_Default(context);

        py += es;
        if(Focus == null) context.fillText("Focus : NULL", px, py );
        else context.fillText("Focus : "+ Focus.Text, px, py );
        py += es;
        if(MouseHover.Control == null) context.fillText("MouseHover : NULL", px, py );
        else context.fillText("MouseHover : "+ MouseHover.Control.Text, px, py );
        py += es;
        context.fillText("Time : " + DrawTime, px, py );
        py += es;
        context.fillText("Translators : " + PageInfo.Translators.length, px, py );
        py += es;
        context.fillText("Animations : " + PageInfo.Animations.length, px, py );
        py += es;
        context.fillText("Templates : " + PageInfo.Templates.length, px, py );
        py += es;
        context.fillText("PlayAnimations : " + PlayAnimations.length, px, py );       
    };
};



function ControlInfo_PageMap(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlInfo_PageMap");
    
    this.BackColor = "white";
    this.Text = "ControlGame";
    this.CanMove = true;

    this.Draw = function(x, y, width, height, context)
    {
        var px = x +10;
        var py = y +25;
        var es = 15;
        if(PageInfo.World == null)context.fillText("World : Aucun", px, py );
        else context.fillText("World : "+ PageInfo.World.Name, px, py );
        py += es;
        if(PageInfo.Map == null) context.fillText("Map : Aucune", px, py );
        else context.fillText("Map : "+ PageInfo.Map.Name +" ("+ PageInfo.Map.Width +"."+ PageInfo.Map.Height +"."+ PageInfo.Map.Depth +")", px, py );
        py += es;
        context.fillText("Case : "+ Case.X +" : "+ Case.Y, px, py );
        py += es;
        context.fillText("Case Adjustment: "+ Case.Adjustment.X +" : "+ Case.Adjustment.Y, px, py );
        py += es;
        context.fillText("Grap : "+ Grap.X +" : "+ Grap.Y, px, py );
        py += es;
        context.fillText("Grap Adjustment: "+ Grap.Adjustment.X +" : "+ Grap.Adjustment.Y, px, py );
        py += es;
        context.fillText("Location : "+ Location.X +"."+ Location.Y +"."+ Location.Z, px, py );

        if( Selected.ID != "")
        {
            var entity = Selected_Entity();
            var entitydraw = null;
            if(entity != null)
            {
            for(var e = 0; e < EntitysDraw.length; e++)
                if( entity.ID == EntitysDraw[e].ID )
                    entitydraw = EntitysDraw[e];
            
                py += es;
                context.fillText("Entity : " + entity.Name +" ["+ entity.ID +"] ("+ entity.X +"."+ entity.Y +"."+ entity.Z +")", px, py );
                if(entitydraw != null)
                {
                    py += es;
                    context.fillText("Move : " + entitydraw.Move.ID +" ("+ entitydraw.Move.Step +")", px, py );
                    if(entity.Move != null)
                    {
                        py += es;
                        context.fillText("Move : " + entity.Move.ID +" ("+ entity.Move.Step +")", px, py );
                    }
                }
            }
        }
        py += es;
        context.fillText("Selected Entity : " + Selected.ID, px, py );
        py += es;
        context.fillText("Selected Target : " + Selected.Target, px, py );
        py += es;
        context.fillText("Target ID: " + Target.ID, px, py );
        py += es;
        if(Target.Cube == null) context.fillText("Target Cube : NULL", px, py );
        else context.fillText("Target Cube : " + Target.Cube.X +"."+ Target.Cube.Y +"."+ Target.Cube.Z, px, py );
        py += es;
        if(Target.Case == null) context.fillText("Target Case : NULL", px, py );
        else context.fillText("Target Case : " + Target.Case.X +"."+ Target.Case.Y, px, py );
        py += es;
        context.fillText("Selected Mouse : " + SelectedMouse.Target, px, py );
        py += es;
        context.fillText("Selected Mouse X Y Z : " + SelectedMouse.X +"."+ SelectedMouse.Y +"."+ SelectedMouse.Z, px, py );
        py += es;
        if(PageInfo.Map == null)
        context.fillText("Permanents : Aucun", px, py );
        else
        context.fillText("Permanents : " + PageInfo.Map.Permanents.length, px, py );
        py += es;
        context.fillText("Entitys : " + Entitys.length, px, py );
        py += es;
        context.fillText("PlayAnimations : " + PlayAnimations.length, px, py );
        py += es;
        if(PageInfo.Map == null)
        context.fillText("NoCeiling : Aucun", px, py );
        else
        context.fillText("NoCeiling : " + PageInfo.Map.NoCeiling.length, px, py );
        
    };
};


























//function ControlCollection(x, y, width, height)
//{
//    this.InheritClass = Control;
//    this.InheritClass( x, y, width, height );
//    delete this.InheritClass;
//    this.Inherit("ControlCollection");

//    this.Border = { Left:10, Top:10, Right:10, Bottom:10 };
//    this.BackColor = "grey";

//    this.OnClip();

//    this.ListIndex = 0;
//    this.MinIndex = 0;
//    this.OriginalHeight = height;
//    this.Maximize = false;
//    this.Collection = new Array();

//    this.AddCollection = function(control)
//    {
//        this.Collection[this.Collection.length] = control;
//        this.OnCollection();
//    };
//    this.Clear = function()
//    {
//        this.Collection = new Array();
//        this.Controls = new Array();
//        this.ListIndex = 0;
//        this.MinIndex = 0;  
//    };

//    this.OnCollection = function(maximize)
//    {
//        this.Controls = new Array();
//        if(maximize != null && maximize != undefined)
//            this.Maximize = maximize;
//        var pY = this.ListIndex;
//        var pH = 0;
//        if(this.Maximize) pY = 0;

//        for(var i = 0; i < this.Collection.length; i++)
//        {
//            if(!this.Collection[i].Visible)continue;
//            this.Collection[i].Location.Y = pY;
//            this.Add(this.Collection[i]);
//            pY += this.Collection[i].Rectangle.Height;
//            pH += this.Collection[i].Rectangle.Height;
//        }

//        if(pH != 0 && this.Maximize)
//            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
//        else if(pH != 0 && this.OriginalHeight > pH+this.Border.Top+this.Border.Bottom)
//            this.ResizeTo(this.Rectangle.Width, pH+this.Border.Top+this.Border.Bottom);
//        else
//            this.ResizeTo(this.Rectangle.Width, this.OriginalHeight);

//        this.MinIndex = 0-pH+this.Rectangle.Height-this.Border.Top-this.Border.Bottom;

//        if(this.ListIndex > 0){ this.ListIndex = 0; this.OnRolled(); }
//        if(this.ListIndex < this.MinIndex){ this.ListIndex = this.MinIndex; this.OnRolled(); }
//    };
////    this.OnRolled = function()
////    {
////        var pY = 0;
////        if( this.Controls != null && this.Controls.length > 0 )
////            for(var i = 0; i < this.Controls.length; i++)
////            {
////                this.Controls[i].MoveTo( this.Controls[i].Rectangle.X, this.Rectangle.Y+this.Border.Top+pY+this.ListIndex ); 
////                pY += this.Controls[i].Rectangle.Height;
////            }
////    };
//    this.OnRolled = function()
//    {
//        var pY = 0;
//        if( this.Collection != null && this.Collection.length > 0 )
//            for(var i = 0; i < this.Collection.length; i++)
//            {
//                if(!this.Collection[i].Visible)continue;
//                this.Collection[i].MoveTo( this.Collection[i].Rectangle.X, this.Rectangle.Y+this.Border.Top+pY+this.ListIndex ); 
//                pY += this.Collection[i].Rectangle.Height;
//            }
//    };
//    this.OnMouseWheel = function(rolled)
//    {
//        if(rolled > 0)rolled = 1;
//        else rolled = -1;
//        
//        if(this.Collection == null || this.Collection.length == 0)return;

//        if( (this.ListIndex == 0 && this.ListIndex+rolled > 0) || (this.ListIndex == this.MinIndex && this.ListIndex+rolled < this.MinIndex) )
//        {
//            if(this.Parent != null)this.Parent.OnMouseWheel(rolled);
//        }
//        else
//        {
//            this.ListIndex += rolled;
//            if(this.ListIndex+rolled > 0) this.ListIndex = 0;
//            if(this.ListIndex+rolled < this.MinIndex) this.ListIndex = this.MinIndex;
//            this.OnRolled();
//        }
//    };

//    this.KeyUpArrow = function(){ this.OnMouseWheel(10); };
//    this.KeyDownArrow = function(){ this.OnMouseWheel(-10); };

//    this.Draw = function(x, y, width, height, context){};
//};



















function ControlTicket(x, y, width, height, txt )
{
    this.InheritClass = TextBox;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlTicket");
    
    this.ReadOnly = true;
    this.BackColor = "lightgrey";
//    this.Text = txt;
    this.SetText(txt);
//    this.Draw = function(x, y, width, height, context)
//    {
//        if(this.Text != null)
//        {
//            var txt = Translate(this.Text);
//            context.fillText(MeasureText(txt, width, context), x, y);
//        }
//    };
};
//Attention si vous utiliser une image provenant d'un site Web externe et qu'un control Parent possède la propriété BackTransparent = true;
//Cela créera une erreur.


function ControlImageUrl(x, y, width, height, border)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, border);
    delete this.InheritClass;
    this.Inherit("ControlImageUrl");

//    this.BackColor = "white";
    this.Controls = [];//new Array();

    this.Image = null;
    this.Draw = function(x, y, width, height, context)
    {
        if(this.Image != null)
            context.drawImage(this.Image, x+this.Border.Left, y+this.Border.Top, width-this.Border.Left-this.Border.Right, height-this.Border.Top-this.Border.Bottom);
    };
    this.ChangeUrl = function(url)
    {
        this.Image = new Image();
        this.Image.src = url;
    };
    this.Clear = function(){this.Image= null;};
    this.CanDrag = true;
    this.OnDrag = function()
    {
        DragDrop.Control = this;
        DragDrop.Element = this.Image;
    };
    this.OnDragDraw = function()
    {
        var form = this.Form;
        if(MouseHover.Control != null)
            form = MouseHover.Control.Form;
        if(DragDrop.Element != null)
            form.Context.drawImage(DragDrop.Element, Mouse.X-form.Position.X, Mouse.Y-form.Position.Y , 50, 50);    
    };
   
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(DragDrop.Control == null || DragDrop.Element == null || !DragDrop.Control.IsInherit("ControlImageUrl"))return;
        DragDrop.Control.Image = null;
        this.Image = DragDrop.Element;
    };
    this.ReadFileDropped = function(evt)
    {
        var files = evt.dataTransfer.files;
        if(files.length == 0)
        {
            this.ChangeUrl(evt.dataTransfer.getData("text"));
        }
        else
        {
            for (var f = 0; f < files.length; f++)
            {
                if (files[f].type.match('image.*')) 
                {
                    var reader = new FileReader();
                    reader.Control = this;
                    reader.onload = function(e) 
                    {
                        this.Control.ChangeUrl(e.target.result);
                    };
                    reader.readAsDataURL(files[f]);
                }
            }
        }
    }; 
};

function ControlImageSpeedUrl(x, y, width, height, params)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, params);
    delete this.InheritClass;
    this.Inherit("ControlImageSpeedUrl");

    this.CanMove = true;
    this.CanResize = true;
    this.BackColor = "white";
    this.Controls = [];

    this.Images = [];
    this.Img_Nbr = 1;
    this.Img_Speed = 0;
    if(params != undefined)
    {
        if(params.ImgNumber != undefined)this.Img_Nbr = params.ImgNumber;
        if(params.ImgSpeed != undefined)this.Img_Speed = params.ImgSpeed;
    }
    
    this.Img_Horizontal = true;
    this.Img_Start = 0;
    this.Img_Index = 0;
    
    this.Img_Add = function(img){ this.Images[this.Images.length] = img; this.ImagesChanged(); };
    this.Add_Url = function(url)
    {
        var img = new Image();
        img.src = url;
        this.Img_Add(img);
    };
    this.Img_Remove = function()
    {
        var temp = [];
        for(var i = 0; i < this.Images.length; i++)
            if(i != this.Img_Index)
                temp[temp.length] = this.Images[i];
        this.Images = temp;
        this.ImagesChanged();
    };
    this.Clear = function()
    {
        this.Images = [];
        this.Img_Start = 0;
        this.Img_Index = 0;
    };
    
    this.ImagesChanged = function(){};
    this.ClickLeft = function()
    {
        if(this.Images.length == 0)return;
        var ind = 0;
        if(this.Img_Horizontal)
        {
            var w = (this.Rectangle.Width-this.Border.Left-this.Border.Right)/this.Img_Nbr;
            ind = Math.floor((Mouse.X-this.Form.Position.X-this.Rectangle.X-this.Border.Left)/w); 
        }
        else
        {
            var h = (this.Rectangle.Height-this.Border.Top-this.Border.Bottom)/this.Img_Nbr;
            ind = Math.floor((Mouse.Y-this.Form.Position.Y-this.Rectangle.Y-this.Border.Top)/h); 
        }
        if(ind >= 0 && ind < this.Img_Nbr)
        {
            if(this.Img_Start+ind > this.Images.length-1)
                this.Img_Index = this.Images.length-1;
            else
                this.Img_Index = this.Img_Start+ind;
        }
    };
    
    
    this.OnMouseWheel = function(rolled)
    {
        if(rolled > 0 && this.Img_Start+this.Img_Nbr < this.Images.length ){ this.Img_Start++; this.Img_Index++ }
        else if(rolled < 0 && this.Img_Start > 0 ){ this.Img_Start--; this.Img_Index-- }
    };
    this.ImageUp = function(){if(this.Img_Index == this.Img_Start+this.Img_Nbr-1)this.OnMouseWheel(10); else this.Img_Index++;};
    this.ImageDown = function(){if(this.Img_Index == this.Img_Start)this.OnMouseWheel(-10); else this.Img_Index--;};

    this.KeyLeftArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };
    this.KeyRightArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyUpArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyDownArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };

    this.KeyBackspace = function(){ this.Img_Remove(); };
    this.KeyDelete = function(){ this.Img_Remove(); };

    this.Draw = function(x, y, width, height, context)
    {
        context.fillText("length : "+ this.Images.length +" Start : "+ this.Img_Start +" Index : "+ this.Img_Index, x, y);
    
        x += this.Border.Left;
        y += this.Border.Top;
        var w = width-this.Border.Left-this.Border.Right;
        var h = height-this.Border.Top-this.Border.Bottom;

        if(h > w) { this.Img_Horizontal = false; h /= this.Img_Nbr; }
        else { this.Img_Horizontal = true; w /=  this.Img_Nbr; }

//        var speed = 0;
        if(this.Img_Speed > 0)
        {
//            speed = Math.floor( this.Images.length * ((DrawTime % this.Img_Speed)/this.Img_Speed) );
            var speed = Math.floor( ((DrawTime % (this.Img_Speed*this.Images.length))/this.Img_Speed) );
            
        context.fillText("speed : "+ speed, x, y-20);

            this.Img_Index += speed - this.Img_Start;
            if(this.Img_Index >= this.Images.length)this.Img_Index-=this.Images.length;
            this.Img_Start = speed;

//            for(var i = 0; i < this.Img_Nbr && i+speed < this.Images.length; i++)
//                if(this.Img_Horizontal)
//                    context.drawImage( this.Images[i+speed], x+(i*w), y, w, h )
//                else
//                    context.drawImage( this.Images[i+speed], x, y+(i*h), w, h )
//            for(var i = 0; i < this.Img_Nbr; i++)
//            {
//                var s = i+speed; 
//                if(i+speed >= this.Images.length)
//                    s = i+speed-this.Images.length;
//                
//                if(this.Img_Horizontal)
//                    context.drawImage( this.Images[i+s], x+(i*w), y, w, h )
//                else
//                    context.drawImage( this.Images[i+s], x, y+(i*h), w, h )
//            }
        }
        
//            for(var n = 0; n < this.Img_Nbr; n++)
//            {
//                var i = n;
//                if(i >= this.Images.length)continue;
//                if(i+this.Img_Start >= this.Images.length)i += this.Img_Start-this.Images.length;
//                if(i < 0)continue;
//                if(i >= this.Images.length)continue;
//                if(this.Img_Horizontal)
//                    context.drawImage( this.Images[i+this.Img_Start], x+(n*w), y, w, h )
//                else
//                    context.drawImage( this.Images[i+this.Img_Start], x, y+(n*h), w, h )
//            }
//        else
//        {
            for(var i = 0; i < this.Img_Nbr && i+this.Img_Start < this.Images.length; i++)
                if(this.Img_Horizontal)
                    context.drawImage( this.Images[i+this.Img_Start], x+(i*w), y, w, h )
                else
                    context.drawImage( this.Images[i+this.Img_Start], x, y+(i*h), w, h )
//        }
        if(this.Img_Horizontal)
            context.strokeRect(x+((this.Img_Index-this.Img_Start)*w), y, w, h);
        else
            context.strokeRect(x, y+((this.Img_Index-this.Img_Start)*h), w, h);       
    };
    
    this.CanDrag = true;
    this.OnDrag = function()
    {
        if(this.Images.length == 0 || this.Images.length <= this.Img_Index)return;
        DragDrop.Control = this;
        DragDrop.Element = this.Images[this.Img_Index];
    };
    this.OnDragDraw = function()
    {
        var form = this.Form;
        if(MouseHover.Control != null)
            form = MouseHover.Control.Form;
        if(DragDrop.Element != null)
            form.Context.drawImage(DragDrop.Element, Mouse.X-form.Position.X, Mouse.Y-form.Position.Y , 50, 50);    
    };
   
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(DragDrop.Control == null || DragDrop.Element == null || (!DragDrop.Control.IsInherit("ControlImageUrl") && !DragDrop.Control.IsInherit("ControlImageListUrl")) )return;
        if(DragDrop.Control.IsInherit("ControlImageUrl"))
            DragDrop.Control.Image = null;
        if(DragDrop.Control.IsInherit("ControlImageListUrl"))
            DragDrop.Control.Img_Remove();
        this.Img_Add(DragDrop.Element);
    };
    this.ReadFileDropped = function(evt)
    {
        var files = evt.dataTransfer.files;
        if(files.length == 0)
        {
            this.Add_Url(evt.dataTransfer.getData("text"));
        }
        else
        {
            for (var f = 0; f < files.length; f++)
            {
                if (files[f].type.match('image.*')) 
                {
                    var reader = new FileReader();
                    reader.Control = this;
                    reader.onload = function(e) 
                    {
                        this.Control.Add_Url(e.target.result);
                    };
                    reader.readAsDataURL(files[f]);
                }
            }
        }
    };
};

function ControlImageListUrl(x, y, width, height, params)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, params);
    delete this.InheritClass;
    this.Inherit("ControlImageListUrl");

    this.CanMove = true;
    this.CanResize = true;
    this.BackColor = "white";
    this.Controls = [];

    this.Images = [];
    this.Img_Size = height-this.Border.Top-this.Border.Bottom;
    this.Img_Nbr = 1;
    this.Img_Horizontal = true;
    if(params != undefined)
    {
        if(params.ImgNumber != undefined)this.Img_Nbr = params.ImgNumber;
    }
    
    this.Img_Start = 0;
    this.Img_Index = 0;
    
    this.Img_Add = function(img){ this.Images[this.Images.length] = img; this.ImagesChanged(); };
    this.Add_Url = function(url)
    {
        var img = new Image();
        img.src = url;
        this.Img_Add(img);
    };
    this.Img_Remove = function()
    {
        var temp = [];
        for(var i = 0; i < this.Images.length; i++)
            if(i != this.Img_Index)
//            if( i != this.Img_Start + this.Img_Index )
                temp[temp.length] = this.Images[i];
        this.Images = temp;
        this.ImagesChanged();
    };
    this.Clear = function()
    {
        this.Images = [];
        this.Img_Start = 0;
        this.Img_Index = 0;
    };
    
    this.ImagesChanged = function(){};
    this.ClickLeft = function()
    {
        if(this.Images.length == 0)return;
        var ind = 0;
        if(this.Img_Horizontal)
        {
            var w = (this.Rectangle.Width-this.Border.Left-this.Border.Right)/this.Img_Nbr;
            ind = Math.floor((Mouse.X-this.Form.Position.X-this.Rectangle.X-this.Border.Left)/w); 
        }
        else
        {
            var h = (this.Rectangle.Height-this.Border.Top-this.Border.Bottom)/this.Img_Nbr;
            ind = Math.floor((Mouse.Y-this.Form.Position.Y-this.Rectangle.Y-this.Border.Top)/h); 
        }
        if(ind >= 0 && ind < this.Img_Nbr)
        {
            if(this.Img_Start+ind > this.Images.length-1)
                this.Img_Index = this.Images.length-1;
            else
                this.Img_Index = this.Img_Start+ind;
        }
    };
    
    
    this.OnMouseWheel = function(rolled)
    {
        if(rolled > 0 && this.Img_Start+this.Img_Nbr < this.Images.length ){ this.Img_Start++; this.Img_Index++ }
        else if(rolled < 0 && this.Img_Start > 0 ){ this.Img_Start--; this.Img_Index-- }
    };
    this.ImageUp = function(){if(this.Img_Index == this.Img_Start+this.Img_Nbr-1)this.OnMouseWheel(10); else this.Img_Index++;};
    this.ImageDown = function(){if(this.Img_Index == this.Img_Start)this.OnMouseWheel(-10); else this.Img_Index--;};

    this.KeyLeftArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };
    this.KeyRightArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyUpArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyDownArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };

    this.KeyBackspace = function(){ this.Img_Remove(); };
    this.KeyDelete = function(){ this.Img_Remove(); };

    this.Draw = function(x, y, width, height, context)
    {
        context.fillText("length : "+ this.Images.length +" Start : "+ this.Img_Start +" Index : "+ this.Img_Index, x, y);
    
        x += this.Border.Left;
        y += this.Border.Top;
        var w = width-this.Border.Left-this.Border.Right;
        var h = height-this.Border.Top-this.Border.Bottom;

        if(h > w) { this.Img_Horizontal = false; h /= this.Img_Nbr; }
        else { this.Img_Horizontal = true; w /=  this.Img_Nbr; }

        for(var i = 0; i < this.Img_Nbr && i+this.Img_Start < this.Images.length; i++)
            if(this.Img_Horizontal)
                context.drawImage( this.Images[i+this.Img_Start], x+(i*w), y, w, h )
            else
                context.drawImage( this.Images[i+this.Img_Start], x, y+(i*h), w, h )

        if(this.Img_Horizontal)
            context.strokeRect(x+((this.Img_Index-this.Img_Start)*w), y, w, h);
        else
            context.strokeRect(x, y+((this.Img_Index-this.Img_Start)*h), w, h);       
    };
    
    this.CanDrag = true;
    this.OnDrag = function()
    {
        if(this.Images.length == 0 || this.Images.length <= this.Img_Index)return;
        DragDrop.Control = this;
        DragDrop.Element = this.Images[this.Img_Index];
    };
    this.OnDragDraw = function()
    {
        var form = this.Form;
        if(MouseHover.Control != null)
            form = MouseHover.Control.Form;
        if(DragDrop.Element != null)
            form.Context.drawImage(DragDrop.Element, Mouse.X-form.Position.X, Mouse.Y-form.Position.Y , 50, 50);    
    };
   
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(DragDrop.Control == null || DragDrop.Element == null || (!DragDrop.Control.IsInherit("ControlImageUrl") && !DragDrop.Control.IsInherit("ControlImageListUrl")) )return;
        if(DragDrop.Control.IsInherit("ControlImageUrl"))
            DragDrop.Control.Image = null;
        if(DragDrop.Control.IsInherit("ControlImageListUrl"))
            DragDrop.Control.Img_Remove();
        this.Img_Add(DragDrop.Element);
    };
    this.ReadFileDropped = function(evt)
    {
        var files = evt.dataTransfer.files;
        if(files.length == 0)
        {
            this.Add_Url(evt.dataTransfer.getData("text"));
        }
        else
        {
            for (var f = 0; f < files.length; f++)
            {
                if (files[f].type.match('image.*')) 
                {
                    var reader = new FileReader();
                    reader.Control = this;
                    reader.onload = function(e) 
                    {
                        this.Control.Add_Url(e.target.result);
                    };
                    reader.readAsDataURL(files[f]);
                }
            }
        }
    };
};

function ControlImageList(x, y, width, height, params)
{
    this.InheritClass = Control;
    this.InheritClass(x, y, width, height, params);
    delete this.InheritClass;
    this.Inherit("ControlImageList");

    this.CanMove = true;
    this.CanResize = true;
    this.BackColor = "white";
    this.Controls = [];

    this.Images = [];
    this.Img_Size = height-this.Border.Top-this.Border.Bottom;
    this.Img_Nbr = 1;
    this.Img_Horizontal = true;
    if(params != undefined)
    {
        if(params.ImgNumber != undefined)this.Img_Nbr = params.ImgNumber;
    }
    
    this.Img_Start = 0;
    this.Img_Index = 0;
    
    this.Img_Add = function(img){ this.Images[this.Images.length] = img; this.ImagesChanged(); };
    this.Img_Remove = function()
    {
        var temp = [];
        for(var i = 0; i < this.Images.length; i++)
            if(i != this.Img_Index)
//            if( i != this.Img_Start + this.Img_Index )
                temp[temp.length] = this.Images[i];
        this.Images = temp;
        this.ImagesChanged();
    };
    this.Clear = function()
    {
        this.Images = [];
        this.Img_Start = 0;
        this.Img_Index = 0;
    };
    
    this.ImagesChanged = function(){};
    this.ClickLeft = function()
    {
        if(this.Images.length == 0)return;
        var ind = 0;
        if(this.Img_Horizontal)
        {
            var w = (this.Rectangle.Width-this.Border.Left-this.Border.Right)/this.Img_Nbr;
            ind = Math.floor((Mouse.X-this.Form.Position.X-this.Rectangle.X-this.Border.Left)/w); 
        }
        else
        {
            var h = (this.Rectangle.Height-this.Border.Top-this.Border.Bottom)/this.Img_Nbr;
            ind = Math.floor((Mouse.Y-this.Form.Position.Y-this.Rectangle.Y-this.Border.Top)/h); 
        }
        if(ind >= 0 && ind < this.Img_Nbr)
        {
            if(this.Img_Start+ind > this.Images.length-1)
                this.Img_Index = this.Images.length-1;
            else
                this.Img_Index = this.Img_Start+ind;
        }
    };
    
    
    this.OnMouseWheel = function(rolled)
    {
        if(rolled > 0 && this.Img_Start+this.Img_Nbr < this.Images.length ){ this.Img_Start++; this.Img_Index++ }
        else if(rolled < 0 && this.Img_Start > 0 ){ this.Img_Start--; this.Img_Index-- }
    };
    this.ImageUp = function(){if(this.Img_Index == this.Img_Start+this.Img_Nbr-1)this.OnMouseWheel(10); else this.Img_Index++;};
    this.ImageDown = function(){if(this.Img_Index == this.Img_Start)this.OnMouseWheel(-10); else this.Img_Index--;};

    this.KeyLeftArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };
    this.KeyRightArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyUpArrow = function(){ if(this.Img_Horizontal)this.ImageUp(); else this.ImageDown(); };
    this.KeyDownArrow = function(){ if(this.Img_Horizontal)this.ImageDown(); else this.ImageUp(); };

    this.KeyBackspace = function(){ this.Img_Remove(); };
    this.KeyDelete = function(){ this.Img_Remove(); };

    this.Draw = function(x, y, width, height, context)
    {
        context.fillText("length : "+ this.Images.length +" Start : "+ this.Img_Start +" Index : "+ this.Img_Index, x, y);
    
        x += this.Border.Left;
        y += this.Border.Top;
        var w = width-this.Border.Left-this.Border.Right;
        var h = height-this.Border.Top-this.Border.Bottom;

        if(h > w) { this.Img_Horizontal = false; h /= this.Img_Nbr; }
        else { this.Img_Horizontal = true; w /=  this.Img_Nbr; }

        for(var i = 0; i < this.Img_Nbr; i++)
            if(this.Img_Horizontal)
                DrawTemplateImage( this.Images[i+this.Img_Start], x+(i*w), y, w, h, context )
            else
                DrawTemplateImage( this.Images[i+this.Img_Start], x, y+(i*h), w, h, context )

        if(this.Img_Horizontal)
            context.strokeRect(x+((this.Img_Index-this.Img_Start)*w), y, w, h);
        else
            context.strokeRect(x, y+((this.Img_Index-this.Img_Start)*h), w, h);       
    };
    
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(DragDrop.Control == null || !DragDrop.Control.IsInherit("ControlTemplate"))return;
        this.Img_Add(DragDrop.Element);
    };
};

function ControlImage(x, y, width, nbr)
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, width/(nbr+1) );
    delete this.InheritClass;
    this.Inherit("ControlImage");

    this.CanResize = false;
    this.BackColor = "white";
    this.Controls = [];

    this.Images = [];
    this.Img_Size = width/(nbr+1);
    this.Img_Nbr = nbr;
    this.Img_Start = 0;
    this.Img_Index = 0;
    
    this.Img_Add = function(img){ this.Images[this.Images.length] = img; this.ImagesChanged(); };
    this.Img_Remove = function()
    {
        var temp = [];
        for(var i = 0; i < this.Images.length; i++)
            if( i != this.Img_Start + this.Img_Index )
                temp[temp.length] = this.Images[i];
        this.Images = temp;
        this.ImagesChanged();
    };
    
    this.Btn_Down = new Control(0, 0, this.Img_Size/2, this.Img_Size);
    this.Btn_Down.CanMove = false;
    this.Btn_Down.CanResize = false;
    this.Btn_Down.ClickLeft = function(){ if(this.Parent.Img_Start > 0)this.Parent.Img_Start--; };
    this.Add(this.Btn_Down);
    
    this.Btn_Up = new Control(this.Img_Size*nbr+(this.Img_Size/2), 0, this.Img_Size/2, this.Img_Size);
    this.Btn_Up.CanMove = false;
    this.Btn_Up.CanResize = false;
    this.Btn_Up.ClickLeft = function(){ if(this.Parent.Img_Start+this.Parent.Img_Nbr < this.Parent.Images.length)this.Parent.Img_Start++; };
    this.Add(this.Btn_Up);
    
    this.ImagesChanged = function(){};
    this.ClickLeft = function(){ this.Img_Index = Math.floor((Mouse.X - this.Form.Position.X - this.Rectangle.X - this.Border.Left - (this.Img_Size/2))/this.Img_Size); };
    
    this.OnKeyDown = function()
    {
        switch(Modifiers.Value)
        {
            case "Esc" :
                this.Img_Remove();
                break;
            case "Delete" :
                this.Img_Remove();
                break;
        }
    };

    this.Clear = function()
    {
        this.Images = [];
        this.Img_Start = 0;
        this.Img_Index = 0;
    };
    this.Draw = function(x, y, width, height, context)
    {
        for(var i = 0; i < this.Img_Nbr; i++)
            DrawTemplateImage( this.Images[i+this.Img_Start], x+this.Border.Left+(i*this.Img_Size)+(this.Img_Size/2), y+this.Border.Top, this.Img_Size, this.Img_Size, context )
        
        context.strokeRect(x+this.Border.Left +(this.Img_Size/2) +(this.Img_Index*this.Img_Size), y+this.Border.Top, this.Img_Size, this.Img_Size);        
    };
    
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(DragDrop.Control == null || !DragDrop.Control.IsInherit("ControlTemplate"))return;
        this.Img_Add(DragDrop.Element);
    };
};

//Ajouter this.ChangeLines = function(){};
//Erreur si le Parent est OnClip()
//Améliorer!!!!!!!
function TextList( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("TextList");
    
    this.Controls = [];
//    this.BackColor = "white";
//    
//    this.Font = PageInfo.Font_TextBox;
    this.Style = "default";
    
    this.ListOpen = false;
    this.Lines = [];
    this.SelectedLine = -1;
    this.HeightLine = height;
    this.LinesToString = function(i){return this.Lines[i].toString();};
    this.RectangleFocus = {X:x, Y:y+this.HeightLine, Width:width, Height:height};
    this.Selected = function(){ if(this.SelectedLine > -1 && this.SelectedLine < this.Lines.length)return this.Lines[this.SelectedLine];else return null; };

    this.ClickLeft = function()
    {  
        if( this.ContainMouseOpen() )
        {
            this.SelectedLine = Math.floor( (Mouse.Y - this.Form.Position.Y - this.RectangleFocus.Y)/this.HeightLine );
            this.ListOpen = false;
            this.SelectedLineChanged();
        }
        else
            this.ListOpen = true;
    };
    this.ClickRight = function(){this.SelectedLine = -1;};//{ this.Clear(); };

    this.Clear = function()
    {
        this.Lines = [];
        this.ChangeStyle();
        this.SelectedLine = -1;
        this.ListOpen = false;
    };
    this.ChangeLines = function(lines){ this.Lines = lines; this.ChangeStyle(); this.SelectedLine = -1; };
    this.SelectedLineChanged = function(){};
    
    this.OnKeyDown = function(){};
    this.ContainMouse = function()
    {
        if( Mouse.X >= this.Form.Position.X +  this.Rectangle.X && Mouse.X <= this.Form.Position.X + this.Rectangle.X + this.Rectangle.Width 
            && Mouse.Y >= this.Form.Position.Y + this.Rectangle.Y && Mouse.Y <= this.Form.Position.Y + this.Rectangle.Y + this.Rectangle.Height )
            return true;
        else if ( this.ContainMouseOpen() )
            return true;
        else
            return false;
    };
    this.ContainMouseOpen = function()
    {
        if( this.ListOpen && Mouse.X >= this.Form.Position.X +  this.RectangleFocus.X && Mouse.X <= this.Form.Position.X + this.RectangleFocus.X + this.RectangleFocus.Width 
            && Mouse.Y >= this.Form.Position.Y + this.RectangleFocus.Y && Mouse.Y <= this.Form.Position.Y + this.RectangleFocus.Y + this.RectangleFocus.Height )
            return true;
    };

    this.OnMouseEnter = function(){ this.ListOpen = true; this.OnFocus(); };
    this.OnMouseLeave = function(){ this.ListOpen = false; };

    this.Moved = function(){ this.ChangeStyle(); };
    this.Resized = function(){ this.ChangeStyle(); };
    this.ChangeStyle = function()
    {
        this.RectangleFocus.X = this.Rectangle.X;
        this.RectangleFocus.Y = this.Rectangle.Y + this.Rectangle.Height;
        this.RectangleFocus.Width = this.Rectangle.Width;
        this.RectangleFocus.Height = this.HeightLine*this.Lines.length;
    };

//    this.Draw = function(x, y, width, height, context){};
//    this.OnDrawing = function(x, y, width, height, context)
    this.Draw = function(x, y, width, height, context)
    {
        context.font = this.Font;   
        context.strokeRect(x, y, width, height);
        if(this.SelectedLine < 0 )
        {
            var txt = MeasureText(Translate(this.Text), width-this.Border.Left-this.Border.Right, context);
            context.fillText( txt, x+this.Border.Left, y+this.Border.Top+this.HeightLine);
        }
        else if(this.Lines.length > 0 )
        {
            context.fillText( this.LinesToString(this.SelectedLine), x, y+this.HeightLine );
        }
            
        if( this.ListOpen )
        {
            var line = -1;
            if( this.ContainMouseOpen() )//facultatif!!!!!!!!!!!!!!!!!!!!
                line = Math.floor( (Mouse.Y - this.Form.Position.Y - this.RectangleFocus.Y)/this.HeightLine );
            for( var i = 0; i < this.Lines.length; i++)
            {
                if( line >= 0 && line == i )
                {
                    context.fillStyle = "Grey";
                    context.fillRect(this.RectangleFocus.X, this.RectangleFocus.Y+(i*this.HeightLine), this.RectangleFocus.Width, this.HeightLine);
                    context.fillStyle = "Black";                        
                }
                else
                {
                    context.fillStyle = "white";
                    context.fillRect(this.RectangleFocus.X, this.RectangleFocus.Y+(i*this.HeightLine), this.RectangleFocus.Width, this.HeightLine);
                    context.fillStyle = "Black";                        
                }
                context.strokeRect (this.RectangleFocus.X, this.RectangleFocus.Y+(i*this.HeightLine), this.RectangleFocus.Width, this.HeightLine);
                context.fillText( this.LinesToString(i), this.RectangleFocus.X, this.RectangleFocus.Y+this.HeightLine+(i*this.HeightLine) );
            }
        }
    };
};


function ControlList(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlList");
    
    this.BackColor = "white";
    this.Controls = [];
    
    this.Lines = [];
    this.SelectedLine = -1;
    this.HeightLine = 25;
    this.MaxLine = 20;
    
    this.Start_Lines = 0;
    this.Selected = function(){ if(this.Lines != null && this.SelectedLine > -1 && this.SelectedLine < this.Lines.length)return this.Lines[this.SelectedLine];else return null; };
    
    this.ClickLeft = function()
    {
        if( Mouse.X > this.Form.Position.X + this.Rectangle.X +this.Border.Left && Mouse.X < this.Form.Position.X + this.Rectangle.X + this.Rectangle.Width - this.Border.Right
                && Mouse.Y > this.Form.Position.Y + this.Rectangle.Y + this.Border.Top && Mouse.Y < this.Form.Position.Y + this.Rectangle.Y + this.Rectangle.Height - this.Border.Bottom )
        {
            this.SelectedLine = this.Start_Lines + Math.floor( (Mouse.Y - this.Form.Position.Y - this.Rectangle.Y - this.Border.Top)/this.HeightLine );
            if(this.SelectedLine + this.Start_Lines >= this.Lines.length)
                this.SelectedLine = this.Lines.length - this.Start_Lines -1;
            this.SelectedLineChanged();
        }
    };
    this.ClickRight = function(){ this.SelectedLine = -1; this.Start_Lines = 0; this.SelectedLineChanged(); };
    this.Clear = function()
    {
        this.Lines = [];
        this.SelectedLine = -1;
        this.Start_Lines = 0;
    };
    this.OnKeyDown = function()
    {
        switch(Modifiers.Value)
        {
            case "Esc" :
                break;
            case "UpArrow" :
                if(this.SelectedLine > 0)
                {
                    this.SelectedLine--;
                    if(this.Start_Lines > this.SelectedLine)
                        this.Start_Lines = this.SelectedLine;
            this.SelectedLineChanged();
                }
                break;
            case "DownArrow" :
                if(this.SelectedLine < this.Lines.length-1)
                {
                    this.SelectedLine++;
                    if(this.Start_Lines < (this.SelectedLine-(this.Rectangle.Height/this.HeightLine))+1)
                        this.Start_Lines++;
            this.SelectedLineChanged();
                }
                break;
        }
    };
    this.SelectedLineChanged = function(){};
    this.Draw = function(x, y, width, height, context)
    {
        if(this.Lines != null)
        for(var i = 0; i < this.MaxLine; i++)
        {
            if( this.HeightLine*(i+1) > this.Rectangle.Height )break;
            var l = this.Start_Lines +i;
            if( l >= this.Lines.length)continue;
        
            if( this.SelectedLine == l )
            {
                context.fillStyle = "Grey";
                context.fillRect(x+this.Border.Left, y+this.Border.Top + (this.HeightLine * i), width-this.Border.Left-this.Border.Right, this.HeightLine);
                context.fillStyle = "Black";                        
            }
            this.LineDraw( l, x+this.Border.Left, y+this.Border.Top + (this.HeightLine*i), context);        
        }
    };
    this.LineDraw = function(line, x, y, context)
    {    
        context.fillText(MeasureText(this.Lines[line].toString(), this.Rectangle.Width-this.Border.Left-this.Border.Right, context), x, y+this.HeightLine);   
    };
    this.ChangeLines = function(lines){ this.Lines = lines; this.SelectedLine = -1; this.Start_Lines = 0; this.SelectedLineChanged(); };
};

function ControlNumber( x, y, width, height, border )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height, border );
    delete this.InheritClass;
    this.Inherit("ControlNumber");

    this.Step = 1;
    this.MinValue = 0;
    this.MaxValue = 1000000;
    
    this.Btn_Down = new Control(0, 0, width/3, height);
    this.Btn_Down.CanFocus = false;
    this.Btn_Down.Text = "#Down";
    this.Btn_Down.ClickLeft = function(){ this.Parent.Down(); };
    this.Add(this.Btn_Down);
    
    this.Number = new TextBox(width/3, 0, width/3, height);
    this.Number.CanMove = false;
    this.Number.Text = "0";
    this.Number.Numeric = true;
//    this.Number.TextChanged = function(){ this.Parent.NumberModified(); };alert();
    this.Number.KeyEnter = function(){ this.Parent.NumberChanged(); };
    this.Add(this.Number);

    this.Btn_Up = new Control(width/1.5, 0, width/3, height);
    this.Btn_Up.CanFocus = false;
    this.Btn_Up.Text = "#Up";
    this.Btn_Up.ClickLeft = function(){ this.Parent.Up(); };
    this.Add(this.Btn_Up);
    
    this.Vertical = false;
    this.Moved = function(){ this.ChangeVertical(); };
    this.Resized = function(){ this.ChangeVertical(); };
    this.Scaled = function(){ this.ChangeVertical(); };
    this.Down = function()
    {
        if(this.GetNumber() - this.Step < this.MinValue)return;
        this.SetNumber( this.GetNumber() - this.Step );
        this.DownChanged();
    };
    this.Up = function()
    {
        if(this.GetNumber() + this.Step > this.MaxValue)return;
        this.SetNumber( this.GetNumber() + this.Step );
        this.UpChanged();
    };
    this.NumberModified = function()
    {
        var num = this.GetNumber();
        if(num == NaN || num == null) this.SetNumber(0);
        else if(num > this.MaxValue) this.SetNumber(this.MaxValue);
        else if(num < this.MinValue) this.SetNumber(this.MinValue);
    };
    this.ChangeVertical = function()
    {
        var x = this.Rectangle.X + this.Border.Left;
        var y = this.Rectangle.Y + this.Border.Top;
        var w = this.Rectangle.Width - this.Border.Left - this.Border.Right;
        var h = this.Rectangle.Height - this.Border.Top - this.Border.Bottom;
        if(this.Rectangle.Width >= this.Rectangle.Height)
        {
            this.Btn_Down.OnRectangleChanged(x, y, w/3, h);
            this.Number.OnRectangleChanged(x+w/3, y, w/3, h);
            this.Btn_Up.OnRectangleChanged(x+w/1.5, y, w/3, h);
        }
        else
        {
            this.Btn_Up.OnRectangleChanged(x, y,  w, h/3);
            this.Number.OnRectangleChanged(x, y+h/3,  w, h/3);
            this.Btn_Down.OnRectangleChanged(x, y+h/1.5, w, h/3);
        }
    };

    this.Draw = function(x, y, width, height, context){};
    this.DownChanged = function(){this.NumberChanged();};
    this.UpChanged = function(){this.NumberChanged();};
    this.NumberChanged = function(){};
    this.GetNumber = function() { return parseFloat(this.Number.Text); };
    this.SetNumber = function(number) { this.Number.SetText(number.toString()); };
    this.Clear = function(){ this.Number.Clear(); };

    this.ChangeVertical();
};

function ControlPoint3D(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlPoint3D");
    
    var cw = width/3;
    var ch = height;
    var cx = 0;
    var cy = 0;
    
    this.Txt_X = new ControlNumber(cx, cy, cw, ch);
    this.Txt_X.Number.Text = "0";
    this.Txt_X.Step = 1;
    this.Txt_X.Number.ReadOnly = false;
    this.Txt_X.CanMove = false;
    this.Txt_X.NumberChanged = function(){this.Parent.Point3DChanged();};
    this.Add(this.Txt_X);
cx += cw;
    this.Txt_Y = new ControlNumber(cx, cy, cw, ch);
    this.Txt_Y.Number.Text = "0";
    this.Txt_Y.Step = 1;
    this.Txt_Y.Number.ReadOnly = false;
    this.Txt_Y.CanMove = false;
    this.Txt_Y.NumberChanged = function(){this.Parent.Point3DChanged();};
    this.Add(this.Txt_Y);
cx += cw;
    this.Txt_Z = new ControlNumber(cx, cy, cw, ch);
    this.Txt_Z.Number.Text = "0";
    this.Txt_Z.Step = 1;
    this.Txt_Z.Number.ReadOnly = false;
    this.Txt_Z.CanMove = false;
    this.Txt_Z.NumberChanged = function(){this.Parent.Point3DChanged();};
    this.Add(this.Txt_Z);
    
    this.Txt_X.Number.Tab = this.Txt_Y.Number;
    this.Txt_Y.Number.Tab = this.Txt_Z.Number;
    this.Txt_Z.Number.Tab = this.Txt_X.Number;
    
    this.Draw = function(x, y, width, height, context){};
    this.KeyEnter = function(){ this.Point3DChanged(); };
    this.Clear = function()
    {
        this.Txt_X.Number.Clear();
        this.Txt_Y.Number.Clear();
        this.Txt_Z.Number.Clear();
    };
    this.GetPoint3D = function()
    {
        return {X:parseInt(this.Txt_X.Number.Text), Y:parseInt(this.Txt_Y.Number.Text), Z:parseInt(this.Txt_Z.Number.Text)};
    };
    this.SetPoint3D = function(point3D)
    {
        this.Txt_X.Number.SetText(point3D.X.toString());
        this.Txt_Y.Number.SetText(point3D.Y.toString());
        this.Txt_Z.Number.SetText(point3D.Z.toString());
    };

    this.SetStep = function(step){ this.Txt_X.Step = step; this.Txt_Y.Step = step; this.Txt_Z.Step = step; };
    this.SetMinValue = function(minvalue){ this.Txt_X.MinValue = minvalue; this.Txt_Y.MinValue = minvalue; this.Txt_Z.MinValue = minvalue; };
    this.SetMaxValue = function(maxvalue){ this.Txt_X.MaxValue = maxvalue; this.Txt_Y.MaxValue = maxvalue; this.Txt_Z.MaxValue = maxvalue; };

    this.Point3DChanged = function(){};
};

function ControlRectangle(x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlRectangle");
    
    var cw = width/4;
    var ch = height;
    var cx = 0;
    var cy = 0;
    
    this.Txt_X = new ControlNumber(cx, cy, cw, ch);
    this.Txt_X.Number.Text = "0";
    this.Txt_X.Step = 1;
    this.Txt_X.Number.ReadOnly = false;
    this.Txt_X.CanMove = false;
    this.Txt_X.NumberChanged = function(){this.Parent.KeyEnter();};
    this.Add(this.Txt_X);
cx += cw;
    this.Txt_Y = new ControlNumber(cx, cy, cw, ch);
    this.Txt_Y.Number.Text = "0";
    this.Txt_Y.Step = 1;
    this.Txt_Y.Number.ReadOnly = false;
    this.Txt_Y.CanMove = false;
    this.Txt_Y.NumberChanged = function(){this.Parent.KeyEnter();};
    this.Add(this.Txt_Y);
cx += cw;
    this.Txt_Width = new ControlNumber(cx, cy, cw, ch);
    this.Txt_Width.Number.Text = "0";
    this.Txt_Width.Step = 1;
    this.Txt_Width.Number.ReadOnly = false;
    this.Txt_Width.CanMove = false;
    this.Txt_Width.NumberChanged = function(){this.Parent.KeyEnter();};
    this.Add(this.Txt_Width);
cx += cw;
    this.Txt_Height = new ControlNumber(cx, cy, cw, ch);
    this.Txt_Height.Number.Text = "0";
    this.Txt_Height.Step = 1;
    this.Txt_Height.Number.ReadOnly = false;
    this.Txt_Height.CanMove = false;
    this.Txt_Height.NumberChanged = function(){this.Parent.KeyEnter();};
    this.Add(this.Txt_Height);

    this.Txt_X.Number.Tab = this.Txt_Y.Number;
    this.Txt_Y.Number.Tab = this.Txt_Width.Number;
    this.Txt_Width.Number.Tab = this.Txt_Height.Number;
    this.Txt_Height.Number.Tab = this.Txt_X.Number;

    this.Draw = function(x, y, width, height, context){};
    this.KeyEnter = function(){ this.ValueChanged(); };
    this.Clear = function()
    {
        this.Txt_X.Number.Clear();
        this.Txt_Y.Number.Clear();
        this.Txt_Width.Number.Clear();
        this.Txt_Height.Number.Clear();
    };
    this.GetRectangle = function()
    {
        return {X:parseInt(this.Txt_X.Number.Text), Y:parseInt(this.Txt_Y.Number.Text), Width:parseInt(this.Txt_Width.Number.Text), Height:parseInt(this.Txt_Height.Number.Text)};
    };
    this.SetRectangle = function(rectangle)
    {
        this.Txt_X.Number.Text = rectangle.X.toString();
        this.Txt_X.Number.Modified();
        this.Txt_Y.Number.Text = rectangle.Y.toString();
        this.Txt_Y.Number.Modified();
        this.Txt_Width.Number.Text = rectangle.Width.toString();
        this.Txt_Width.Number.Modified();
        this.Txt_Height.Number.Text = rectangle.Height.toString();
        this.Txt_Height.Number.Modified();
    };

    this.SetStep = function(step){ this.Txt_X.Step = step; this.Txt_Y.Step = step; this.Txt_Width.Step = step; this.Txt_Height.Step = step; };
    this.SetMinValue = function(minvalue){ this.Txt_X.MinValue = minvalue; this.Txt_Y.MinValue = minvalue; this.Txt_Width.MinValue = minvalue; this.Txt_Height.MinValue = minvalue; };
    this.SetMaxValue = function(maxvalue){ this.Txt_X.MaxValue = maxvalue; this.Txt_Y.MaxValue = maxvalue; this.Txt_Width.MaxValue = maxvalue; this.Txt_Height.MaxValue = maxvalue; };

    this.ValueChanged = function(){};
};

function ControlOnOff( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlCube");
    
    this.CanResize = false;
    this.CanMove = false;

    this.OnOff = false;
    this.TextOn = "";
    this.TextOff = "";
    this.SetText = function(txt, txtoff){ if(txtoff == undefined)txtoff = txt; this.Text = txtoff; this.TextOn = txt; this.TextOff = txtoff; };
    this.ClickLeft = function(){ this.OnOff = !this.OnOff;if(this.OnOff)this.Text=this.TextOn;else this.Text=this.TextOff; this.OnOffChanged(); };
    this.OnOffChanged= function(){};
    this.Draw = function(x, y, width, height, context)
    {
        var gradient = context.createLinearGradient(x, y, x+width, y);
        gradient.addColorStop(0,"black");
        if (this.OnOff)
            gradient.addColorStop(0.5,"green");
        else
            gradient.addColorStop(0.5,"red");
        gradient.addColorStop(1,"white")
        context.fillStyle = gradient;
        context.fillRect(x, y, width, height);

        context.fillStyle = "white";
        if(this.Text != null)
        {
            var txt = Translate(this.Text);
            context.fillText(txt.substr(0,25), x+10, y+15);
        }
    };
};
function ControlBack()
{
    this.InheritClass = Control;
    this.InheritClass(0, 0, 25, 10);
    delete this.InheritClass;
    this.Inherit("ControlBack");
    this.CanFocus = false;
    this.ClickLeft = function() { this.Parent.OnBack(); };
//    this.OnRectangleChanged = function( x, y, width, height ){this.RectangleChanged();  };
//    this.Moved = function(){this.RectangleChanged();  };
//    this.Resized = function(){this.RectangleChanged();  };
//    this.RectangleChanged = function()
//    {
//        this.Rectangle.X = this.Parent.Rectangle.X + this.Parent.Border.Left;
//        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
//    };
//    this.ParentChanged = function(){ this.RectangleChanged(); };

    this.MoveTo = function(x, y)
    {
        this.Rectangle.X = this.Parent.Rectangle.X + this.Parent.Border.Left;
        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
        this.Location.X = 0;
        this.Location.Y = 5 -this.Parent.Border.Top;
        this.Moved();
    };
};
function ControlForward()
{
    this.InheritClass = Control;
    this.InheritClass( 0, 0, 25, 10 );
    delete this.InheritClass;
    this.Inherit("ControlForward");
    this.CanFocus = false;
    this.ClickLeft = function() { this.Parent.OnForward(); };
    this.OnRectangleChanged = function( x, y, width, height ){this.RectangleChanged();  };
//    this.Moved = function(){this.RectangleChanged();  };
//    this.Resized = function(){this.RectangleChanged();  };
//    this.RectangleChanged = function()
//    {
//        this.Rectangle.X = this.Parent.Rectangle.X + (this.Parent.Border.Left*2) + this.Rectangle.Width;
//        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
//    };
//    this.ParentChanged = function(){ this.RectangleChanged(); };
    this.MoveTo = function(x, y)
    {
        this.Rectangle.X = this.Parent.Rectangle.X + (this.Parent.Border.Left*2) + this.Rectangle.Width;
//        this.Rectangle.X = this.Parent.Rectangle.X + this.Parent.Border.Left;
        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
        this.Location.X = this.Parent.Border.Left + this.Rectangle.Width;
        this.Location.Y = 5 -this.Parent.Border.Top;
        this.Moved();
    };
};
function ControlClose()
{
    this.InheritClass = Control;
    this.InheritClass( 0, 0, 10, 10 );
    delete this.InheritClass;
    this.Inherit("ControlClose");
    this.CanFocus = false;
    this.ClickLeft = function() { this.Parent.Hide(); };
//    this.OnRectangleChanged = function( x, y, width, height ){this.RectangleChanged();  };
//    this.Moved = function(){this.RectangleChanged();  };
//    this.Resized = function(){this.RectangleChanged();  };
//    this.RectangleChanged = function()
//    {
//        this.Rectangle.X = this.Parent.Right() - 15;
//        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
//    };
//    this.ParentChanged = function(){ this.RectangleChanged(); };
    this.OnDrawing = function(x, y, width, height, context)
    {
        context.fillStyle = "orange";
        context.fillRect(x, y, width, height);
        context.strokeRect (x, y, width, height);
    
        Interface_Default(context);
    };
    this.MoveTo = function(x, y)
    {
        this.Rectangle.X = this.Parent.Right() - 15;
        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
//        this.Rectangle.X = this.Parent.Rectangle.X + (this.Parent.Border.Left*2) + this.Rectangle.Width;
////        this.Rectangle.X = this.Parent.Rectangle.X + this.Parent.Border.Left;
//        this.Rectangle.Y = this.Parent.Rectangle.Y + 5;
        this.Location.X = this.Parent.Rectangle.Width - this.Parent.Border.Left -15;
        this.Location.Y = 5 -this.Parent.Border.Top;
        this.Moved();
    };
};


function ControlContainer( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ControlContainer");
    
    this.Border = {Left:10, Top:10, Right:10, Bottom:10 };    
    this.CanMove = true;
    this.CanResize = true;
    this.BackColor = "blue";
    
    this.Container = null;
    this.Spacing = 5;
    this.SizeCase = {Width:width, Height:height};
    this.IndexCase = 0;
    this.ContainerJSON = function(){ return this.Container.Name +PageInfo.Separator+ this.Container.Owner +PageInfo.Separator+ this.IndexCase;  };
    
    this.ClickLeft = function() { this.IndexCase = this.SelectedCase(); };
    this.SelectedCase = function()
    {
        var x = Math.floor( (Mouse.X - this.Form.Position.X - this.Rectangle.X - this.Border.Left) / (this.SizeCase.Width + this.Spacing) );
        var y = Math.floor( (Mouse.Y - this.Form.Position.Y - this.Rectangle.Y - this.Border.Top) / (this.SizeCase.Height + this.Spacing) );
        return (y*this.Container.NbrX)+x;
    };
    this.CanDrag = true;
    this.OnDrag = function()
    {
        if(this.Container == null)return;
        if( 0 > this.IndexCase || this.IndexCase > this.Container.Entitys.length)return;
        if(this.Container.Entitys[this.IndexCase] == null)return; 
        DragDrop.Control = this;
        DragDrop.Element = this.Container.Entitys[this.IndexCase];
    };
    this.OnDragDraw = function()
    {
        var form = this.Form;
        if(MouseHover.Control != null)
            form = MouseHover.Control.Form;
        if(DragDrop.Element != null)
            DrawTemplateImage( DragDrop.Element.Body[0], Mouse.X-form.Position.X, Mouse.Y-form.Position.Y , 50, 50, form.Context );
    };
    this.CanDrop = true;
    this.OnDrop = function()
    {
        if(!DragDrop.Control.IsInherit("ControlContainer"))return;
        var txt = DragDrop.Control.ContainerJSON();
        this.IndexCase = this.SelectedCase();
        CallPage("CONTAINER", txt +PageInfo.Separator+ this.ContainerJSON() );
    };
    this.OnKeyDown = function()
    {
        switch(Modifiers.Value)
        {
            case "Esc" :
                this.Hide();
                break;
        }
    };
    this.Draw = function(x, y, width, height, context)
    {
        if(this.Container == null)return;
        this.SizeCase.Width = (width-this.Border.Left-this.Border.Right - (this.Spacing*(this.Container.NbrX+1))) / this.Container.NbrX;
        this.SizeCase.Height = (height-this.Border.Top-this.Border.Bottom - (this.Spacing*(this.Container.NbrY+1))) / this.Container.NbrY;
        
        for(var py = 0; py < this.Container.NbrY; py++)
            for(var px = 0; px < this.Container.NbrX; px++)
            {
                var i = (py*this.Container.NbrX)+px;
                if( this.Container.Entitys[i] != null)
                {
                    DrawTemplateImage(this.Container.Entitys[i].Body[0], x+this.Border.Left + (px*this.SizeCase.Width) + ((px+1)*this.Spacing), y+ this.Border.Top + (py*this.SizeCase.Height) + ((py+1)*this.Spacing), this.SizeCase.Width, this.SizeCase.Height, context);//     Cube.Floors[i], x - size, y - size, size*2, size*2, ctx );
                    context.strokeRect(x+this.Border.Left + (px*this.SizeCase.Width) + ((px+1)*this.Spacing), y+this.Border.Top + (py*this.SizeCase.Height) + ((py+1)*this.Spacing), this.SizeCase.Width, this.SizeCase.Height);
                }
            }       
    };
};




function PowersControl( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("PowersControl");
    
    this.Border = {Left:0, Top:0, Right:0, Bottom:0 };
    this.BackColor = "grey";

    this.CanMove = true;
    this.CanResize = false;

    this.Powers = [];
    this.Pwr_Index = -1;
    this.NbrX = 6;
    this.NbrY = 2;
    
    
    this.CanDrag = true;
    this.CanDrop = true;
    this.OnDrag = function()//Copy
    {
        DragDrop.Control = this;
        if(this.Pwr_Index > -1 && this.Powers.length > 0 && this.Powers[this.Pwr_Index] != null)
            DragDrop.Element = this.Powers[this.Pwr_Index];
    };
    this.OnDrop = function()
    {
        if(DragDrop.Control.IsInherit("PowersControl"))
        {
            DragDrop.Control.Powers[DragDrop.Element] = null;
            var temp = null;
            if(this.Powers[this.Pwr_Index] != null)
                temp = this.Powers[this.Pwr_Index];
            this.Powers[this.Pwr_Index] = DragDrop.Element;
            DragDrop.Element = temp;
        }
    };
    
    this.ClickLeft = function()
    {
        if(this.Powers[this.Pwr_Index] != null)
            this.OnPower(this.Pwr_Index);
    };
    this.OnPower = function(index)
    {
        if(index >= this.Powers.length)return;
        if(this.Powers[index].Target == "Cursor")
            SelectedMouse.Power = this.Powers[index];
        else if(this.Powers[index].Target == "Dynamic")
            CallPowerMouse(this.Powers[index].Name);
        else if(this.Powers[index].Target == "Automatic")
            CallPower(this.Powers[index].Name);
    };
    this.IndexFromMouse = function ()
    {
        var pW = (this.Rectangle.Width-this.Border.Left-this.Border.Right) / this.NbrX;
        var pH = (this.Rectangle.Height-this.Border.Top-this.Border.Bottom) / this.NbrY;
        var pX = Math.floor((Mouse.X - this.Form.Position.X - this.Rectangle.X - this.Border.Left)/pW);
        var pY = Math.floor((Mouse.Y - this.Form.Position.Y - this.Rectangle.Y - this.Border.Top)/pH);
        return (pY*this.NbrX)+pX;
    };
    this.OnMouseLeave = function (){ this.Pwr_Index = -1; };
    this.MouseMove = function (){ this.Pwr_Index = this.IndexFromMouse(); };
    
    this.OnDragDraw = function()
    {
        var form = this.Form;
        if(MouseHover.Control != null)
            form = MouseHover.Control.Form;
        if(DragDrop.Element != null)
            DrawTemplateImage( DragDrop.Element.Image, Mouse.X-form.Position.X, Mouse.Y-form.Position.Y , 50, 50, form.Context );
    };
    this.Draw = function(x, y, width, height, context)
    {
        var pW = (width-this.Border.Left-this.Border.Right) / this.NbrX;
        var pH = (height-this.Border.Top-this.Border.Bottom) / this.NbrY;
        for(var pY = 0; pY < this.NbrY; pY++)
            for(var pX = 0; pX < this.NbrX; pX++)
            {
                var i = (pY*this.NbrX)+pX;
                if(this.Powers[i] != null)
                    DrawTemplateImage(this.Powers[i].Image, x+this.Border.Left+(pX*pW), y+this.Border.Top+(pY*pH), pW, pH, context);
                if(this.Powers[i] != null && i == 3)
                    context.fillText(Now() - ConvertDateTime(this.Powers[i].LastAction), x+this.Border.Left+(pX*pW), y+this.Border.Top+(pY*pH));
                if(this.Pwr_Index == i)
                    context.strokeRect(x+this.Border.Left+(pX*pW), y+this.Border.Top+(pY*pH), pW, pH);
            }
    };
};




////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
//Power Optionnel dans Core.Utility
function PowerControl( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("PowerControl");
    
    this.CanDrag = true;
    this.CanMove = false;
    this.CanResize = false;
    
    this.Power = null;
    
    this.OnDrag = function()//Copy
    {
        DragDrop.Control = this.Parent;
        DragDrop.Element = this;
    };
    this.OnDrop = function()
    {
        if(MouseHover.Control != null && MouseHover.Control != DragDrop.Control)
        {
            var control = new PowerControl("Power",0,0,50,50);
            control.Power = this.Power;
            var add = MouseHover.Control.Add(control);
        }
    };
    
    this.ClickLeft = function()
    {
        if(this.Power != null)
            CallPower(this.Power.Name);
    };
    
    this.OnDragDraw = function()
    {
        if(this.Power == null)return;
        var form = this.Form;
        if( MouseHover.Control != null)
            form = MouseHover.Control.FindForm();
        form.Context.drawImage(this.Power.Image, Mouse.X-form.Position.X, Mouse.Y-form.Position.Y, this.Rectangle.Width, this.Rectangle.Height);
    
    };
    this.OnDrawing = function(x, y, width, height, context)
    {
        this.Power.Step += DrawStep;
        
        if(this.Power == null)return;
        
        context.drawImage(this.Power.Image, x, y, width, height);
        context.fillText( this.Power.Name +" : "+ (this.Power.Speed-this.Power.Step), x+(width/2), y+(height/2));
        Interface_Default(context);
    };
};
function PowerBar( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("PowerBar");

    this.Horizontal = true;
    
    this.OnDrop = function()
    {
        if(DragDrop.Control != this)
        {
            var control = new PowerControl("Power",0,0,50,50);
            control.Power = this.Power;
            var add = MouseHover.Control.Add(control);
        }
    };
};

function ChatControl( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("ChatControl");

    this.Chats = null;
    this.HeightLine = 25;
    this.MaxLine = 10;
    this.Rectangle_Chat = {X:this.Border.Left, Y:this.Border.Top, Width:this.Rectangle.Width-this.Border.Left-this.Border.Right-50, Height:this.HeightLine*this.MaxLine};

    this.IndexLine = 0;

    this.TextBox_Chat = new TextBox(this.Border.Left, this.Border.Top+this.Rectangle_Chat.Height, this.Rectangle.Width-this.Border.Left-this.Border.Right-50, 25);
    this.Add(this.TextBox_Chat);
    
    this.TextBox_Chat.KeyboardEnter = function(){ CallChat("Canal",this.Text); this.SetText(""); };
    
    this.OnDraw = Function_Draw_ChatControl;
};


var Function_Draw_ChatControl = function(context, x, y)
{   
    this.Form.Context.fillStyle = "grey";
    this.Form.Context.fillRect(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);
    this.Form.Context.strokeRect (this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);
    
    this.Form.Context.fillStyle = "white";
    this.Form.Context.fillRect(this.Rectangle.X + this.Border.Left, this.Rectangle.Y + this.Border.Top, this.Rectangle.Width - this.Border.Left-this.Border.Right, this.Rectangle.Height - this.Border.Top-this.Border.Bottom);
    
    Interface_Default(context);
    
    this.Form.Context.strokeRect(this.Rectangle.X+this.Rectangle_Chat.X, this.Rectangle.Y+this.Rectangle_Chat.Y, this.Rectangle_Chat.Width, this.Rectangle_Chat.Height);
    
    if(Chats != null)
    {
        Interface_Default(context);
        var x = this.Rectangle.X+this.Rectangle_Chat.X; var y = this.Rectangle.Y+this.Rectangle_Chat.Y+this.HeightLine;
        for( var t = this.IndexLine; t < this.IndexLine + this.MaxLine; t++) //this.Translator.Translates.length; t++)
        {
            if(t >= Chats[0].Chats.length)break;
            this.Form.Context.fillText(Chats[0].Chats[t].Name +" : "+ Chats[0].Chats[t].Text, x, y );
            y += this.HeightLine;
        }
    }
    if( this.Controls != null )
    for(var i = this.Controls.length; i >= 0 ; i--)
    {
        if ( this.Controls[i] != null && this.Controls[i].Visible )
            this.Controls[i].OnDraw(undefined, 0, 0);//();
    }
};

function FormControl( x, y, width, height )
{
    this.InheritClass = Control;
    this.InheritClass( x, y, width, height );
    delete this.InheritClass;
    this.Inherit("FormControl");
    
    this.Border = {Left:10, Top:20, Right:10, Bottom:10 };

    this.Add( new ControlClose() );

    this.OnDraw = function(context, x, y)
    {
        this.Form.Context.fillStyle = "grey";
        this.Form.Context.fillRect(this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);
        this.Form.Context.strokeRect (this.Rectangle.X, this.Rectangle.Y, this.Rectangle.Width, this.Rectangle.Height);
    
        this.Form.Context.fillStyle = "white";
        this.Form.Context.fillRect(this.Rectangle.X + this.Border.Left, this.Rectangle.Y + this.Border.Top, this.Rectangle.Width - this.Border.Left-this.Border.Right, this.Rectangle.Height - this.Border.Top-this.Border.Bottom);
        Interface_Default(context);
        
        if( this.Controls != null )
        for(var i = this.Controls.length; i >= 0 ; i--)
        {
            if ( this.Controls[i] != null && this.Controls[i].Visible )
                this.Controls[i].OnDraw(undefined, 0, 0);//();
        }
    };
};

