import ColorsMenu from "../ColorsMenu";
import { IPlayer } from "utils/types";
import React from "react";
import { useMobile } from "context/MobileContextProvider";
import usePlayerStyles from "./Player.styles";
import { useSettings } from "context/SettingsContextProvider";
import { useTranslation } from "react-i18next";

export interface IPlayerProps {
  id: string | number;
  color: string;
  backgroundColor: string;
  name: string;
  list: Array<IPlayer>;
  setList: (value: IPlayer[]) => void;
  index: number;
}

export default function Player(props: IPlayerProps): JSX.Element {
  const { t } = useTranslation();
  const { isMobile, orientation } = useMobile()!; // eslint-disable-line
  const { names } = useSettings()!; // eslint-disable-line

  const [isMenuShowing, setIsMenuShowing] = React.useState(false);
  const [longPressed, setLongPressed] = React.useState(false);

  const htmlElRef = React.useRef(null);

  const playerStyles = usePlayerStyles({
    names,
    isMobile,
    orientation,
    longPressed,
    ...props,
  });

  const { id, color, name, list, setList, index } = props;

  const handleChange = (
    player: number,
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const players: Array<IPlayer> = [...list];
    players[player].name = event.currentTarget.value;
    setList(players);
  };

  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const currentInput = (htmlElRef.current as unknown) as HTMLInputElement;
      const nextParent =
        currentInput.parentElement?.parentElement?.nextElementSibling ??
        currentInput.parentElement?.parentElement?.parentElement
          ?.firstElementChild;
      const nextInput = nextParent?.lastChild?.firstChild as HTMLInputElement;
      nextInput?.select();
    }
  };

  // put this in for mobile only
  // so users know they are interacting with the object
  const useLongPress = (ms = 50) => {
    const [startLongPress, setStartLongPress] = React.useState(false);

    React.useEffect(() => {
      let timerId: number | undefined = undefined;
      if (startLongPress) {
        timerId = setTimeout(() => {
          window.navigator.vibrate(-1) && window.navigator.vibrate(200);
          setLongPressed(true);
        }, ms);
      } else {
        setLongPressed(false);
        clearTimeout(timerId);
      }

      return () => {
        clearTimeout(timerId);
      };
    }, [ms, startLongPress]);

    return {
      onMouseDown: () => setStartLongPress(true),
      onMouseUp: () => setStartLongPress(false),
      onMouseLeave: () => setStartLongPress(false),
      onTouchStart: () => setStartLongPress(true),
      onTouchEnd: () => setStartLongPress(false),
    };
  };

  const longPressEvents = useLongPress();

  return (
    <div
      className={`${playerStyles.container} player-handle`}
      {...longPressEvents}
    >
      {isMenuShowing && !isMobile && (
        <ColorsMenu
          isMenuShowing={isMenuShowing}
          setIsMenuShowing={setIsMenuShowing}
          currentColor={id}
        />
      )}
      <div className={playerStyles.icon}>
        <img
          onClick={() => {
            if (names && !isMobile) {
              setIsMenuShowing(!isMenuShowing);
            }
          }}
          src={`assets/${color}.png`}
          alt={color}
          className="player-handle"
        />
      </div>
      {names && (
        <div className={playerStyles.name}>
          <input
            type="text"
            placeholder={t("main.player")}
            className={playerStyles.input}
            onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
              handleChange(index, event)
            }
            onKeyPress={handleKeyPress}
            value={name}
            ref={htmlElRef}
          />
        </div>
      )}
    </div>
  );
}
