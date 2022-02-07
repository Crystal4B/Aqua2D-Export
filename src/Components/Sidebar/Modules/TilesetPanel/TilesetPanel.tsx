import Toolbar from '../Toolbar';
import './TilesetPanel.css'
import {getCoords} from '../../../../Helpers/TileHelper';
import { useDispatch, useSelector } from 'react-redux';
import React, { useRef, useState } from 'react';
import { switchTile, switchTileset } from '../../../../Redux/Tools/toolActions';
import { extractFilesAsURL } from '../../../../Helpers/InputHelper';
import { rootState } from '../../../../Redux/store';
import { toolState } from '../../../../Redux/Tools/toolReducer';

const TilesetPanel = () =>
{
	const tilesetUrl = useSelector<rootState, toolState["tileset"]>(state => state.toolbar.tileset);

	const assetRef = useRef<HTMLImageElement>(null);
	const inputRef = useRef(null);
	const [selection, setSelection] = useState({xPos: 0, yPos: 0, selected: false});
	const dispatch = useDispatch();

	const handleOnClick = (e: React.MouseEvent) => {
		const [x, y] = getCoords(e);
		setSelection({xPos: x*32, yPos: y*32, selected: true});
		
		dispatch(switchTile(x, y));
	}

	const handleDragOver = (e: React.MouseEvent) =>
	{
		e.preventDefault();
		e.stopPropagation();
	}

	const handleDrop = (e: React.DragEvent<HTMLInputElement>) =>
	{
		e.preventDefault();
		e.stopPropagation();

		const {dataTransfer} = e;
		const url = extractFilesAsURL(dataTransfer);
		if (url)
		{
			dispatch(switchTileset(url));
		}
	}

	return (
		<div className="panel">
			<div className="header">Tileset</div>
			<div className="content">
				<Toolbar />
				<div className="tileset" style={{height: "50vh"}}>
					{selection.selected ? <div className='selection' style={{left:`${selection.xPos}px`, top:`${selection.yPos}px`}}></div> : null}
					<input
						type={"file"}
						
						onDrop={handleDrop}/>
					<img ref={assetRef} onClick={handleOnClick} src={tilesetUrl}/>
				</div>
			</div>
		</div> 
	)
}

export default TilesetPanel;