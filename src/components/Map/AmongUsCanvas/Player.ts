import { getSections, setSections } from "store/slices/SectionsSlice";

import Entity from "./Entity";
import { IPlayer } from "utils/types/players";
import { IRect } from "utils/types/shared";
import { MOUSE_BUTTON } from "constants/mouse";
import Rectangle from "utils/math/Rectangle";
import Vector from "utils/math/Vector";
import { drawStrokeText } from "./tools";
import { setPlayerSection } from "store/slices/PlayersSlice";
import store from "store";

export default class Player extends Entity {
  public constructor(
    data: IPlayer,
    position: Vector,
    sections: Array<number>,
    image: HTMLImageElement,
    aliveRect: IRect,
    deadRect: IRect,
    debug = false
  ) {
    super(new Rectangle(position, aliveRect.w, aliveRect.h), debug);

    this.aliveRect = aliveRect;
    this.deadRect = deadRect;

    this.updatePlayer(data, sections);

    this.image = image;

    this.rect.setPosition(position);

    this.draggable = true;
    this.active = false;
  }

  public updatePlayer(data: IPlayer, sections: Array<number>): void {
    this.data = data;

    this.resetSectionId = sections[0];
    this.deadSectionId = sections[1];
    this.unusedSectionId = sections[2];

    this.draggable = true;

    if (data.section === this.deadSectionId) {
      this.imageRect = this.deadRect;
    } else {
      this.imageRect = this.aliveRect;

      if (data.section === this.unusedSectionId) {
        this.draggable = false;
      }
    }

    this.rect.setDimensions(this.imageRect.w, this.imageRect.h);
  }

  public render(): void {
    super.render();

    if (this.data.section !== this.unusedSectionId) {
      this.context.save();

      if (this.active) {
        this.context.shadowBlur = 15;
        this.context.shadowColor = "#C2D2E3";
      }

      if (this.data.name != "") {
        const width = this.context.measureText(this.data.name).width;

        drawStrokeText(
          this.context,
          this.rect.getX() + (this.rect.getWidth() - width) / 2,
          this.rect.getY() - 20,
          this.data.name
        );
      }

      this.context.drawImage(
        this.image,
        this.imageRect.x,
        this.imageRect.y,
        this.imageRect.w,
        this.imageRect.h,
        this.rect.getX(),
        this.rect.getY(),
        this.rect.getWidth(),
        this.rect.getHeight()
      );

      this.context.restore();
    }
  }

  public onMouseMove(coordinate: Vector): boolean {
    if (this.active) {
      this.rect.setPosition(
        coordinate.x - this.rect.getWidth() / 2,
        coordinate.y - this.rect.getHeight() / 2
      );

      return true;
    }

    return false;
  }

  public onMouseDown(button: MOUSE_BUTTON, coordinate: Vector): boolean {
    this.active = this.draggable && this.rect.isPointInside(coordinate);

    return this.active;
  }

  public onMouseUp(button: MOUSE_BUTTON, coordinate: Vector): boolean {
    this.active = !(this.draggable && this.rect.isPointInside(coordinate));

    return this.active;
  }

  public onDoubleClick(coordinate: Vector): boolean {
    if (
      this.rect.isPointInside(coordinate) &&
      this.data.section !== this.unusedSectionId
    ) {
      const sections = getSections(store.getState());

      let newSection = this.resetSectionId;

      if (this.data.section === this.deadSectionId) {
        store.dispatch(
          setSections(
            sections.map((section) => ({
              ...section,
              players:
                section.id === this.deadSectionId
                  ? [
                      ...section.players.filter(
                        (player) => player.id !== this.data.color
                      ),
                    ]
                  : section.id === this.resetSectionId
                  ? [
                      ...section.players,
                      {
                        id: this.data.color as string,
                      },
                    ]
                  : [...section.players],
            }))
          )
        );
      } else {
        store.dispatch(
          setSections(
            sections.map((section) => ({
              ...section,
              players:
                section.id !== this.deadSectionId
                  ? [
                      ...section.players.filter(
                        (player) => player.id !== this.data.color
                      ),
                    ]
                  : [
                      ...section.players,
                      {
                        id: this.data.color as string,
                      },
                    ],
            }))
          )
        );

        newSection = this.deadSectionId;
      }

      store.dispatch(setPlayerSection({ player: this.data.color, newSection }));

      return true;
    }

    return false;
  }

  private data!: IPlayer;

  private resetSectionId!: number;
  private deadSectionId!: number;
  private unusedSectionId!: number;

  private image: HTMLImageElement;
  private imageRect!: IRect;

  private aliveRect: IRect;
  private deadRect: IRect;

  private draggable: boolean;
  private active: boolean;
}