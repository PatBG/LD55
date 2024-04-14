
export abstract class Global {

    public static readonly SCREEN_WIDTH: number = 720;
    public static readonly SCREEN_HEIGHT: number = 1280;
    public static readonly SCREEN_CENTER_X: number = Global.SCREEN_WIDTH / 2;
    public static readonly SCREEN_CENTER_Y: number = Global.SCREEN_HEIGHT / 2;

    public static readonly FONT_SIZE: number = 38;
    public static readonly FONT_FAMILY = 'Comic Sans MS'; // 'Arial Black'

    public static readonly MENU_STYLE = {
        fontFamily: Global.FONT_FAMILY,
        fontSize: Global.FONT_SIZE, color: '#ffffff',
        stroke: '#000000', strokeThickness: 8,
        align: 'center'
    }
}