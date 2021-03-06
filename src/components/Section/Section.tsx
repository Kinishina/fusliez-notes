import { IPlayer } from "utils/types";
import Player from "components/Player";
import React from "react";
import { ReactSortable } from "react-sortablejs";
import colorNameToRGB from "utils/colorConverter";
import { useSettings } from "context/SettingsContextProvider";
import useStyles from "./Section.styles";

export interface ISectionProps {
  title: string;
  list: Array<IPlayer>;
  setList: (value: IPlayer[]) => void;
  isMobile: boolean;
}

export default function Section(props: ISectionProps): JSX.Element {
  const { names } = useSettings()!; // eslint-disable-line

  const classes = useStyles({ names });

  const { isMobile, title, list, setList } = props;
  return (
    <React.Fragment>
      <div className={classes.root}>
        <h2>{title}</h2>

        <ReactSortable
          group="players"
          handle=".player-handle"
          delayOnTouchOnly={isMobile}
          // have to add filter and preventOnFilter
          // to enable input on mobile devices
          // but by doing so
          // limits the dragging by the icon only
          filter={isMobile ? "input" : ""}
          preventOnFilter={false}
          delay={isMobile ? 150 : 0}
          touchStartThreshold={3}
          list={list}
          setList={setList}
          className={classes.players}
        >
          {list.map(({ id, color, name }, index) => (
            <Player
              key={id}
              id={id}
              // temporary solution for alternative colors for better contrast
              // if needed, we can move these colors to be part of the nested player object
              // and have the backgroundColor as one of the keys and use that to map it out
              backgroundColor={colorNameToRGB(
                color === "brown"
                  ? "saddlebrown"
                  : color === "blue"
                  ? "cornflowerblue"
                  : color === "purple"
                  ? "darkorchid"
                  : color === "red"
                  ? "scarlet"
                  : color
              )}
              color={color}
              name={name}
              list={list}
              setList={setList}
              index={index}
            />
          ))}
        </ReactSortable>
      </div>
    </React.Fragment>
  );
}
