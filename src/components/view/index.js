///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import loadIcon from '../../asset/img/loading-hor16.gif';
///////////////////////////////////////////////////////////////////////////////
import axios from 'axios';
import * as CONSTANTS from '../../config';
import Helper from '../../helper';
import Gallery from 'react-grid-gallery';
///////////////////////////////////////////////////////////////////////////////
import './style.scss';
///////////////////////////////////////////////////////////////////////////////
class View extends Component {
	//=========================================================================
	constructor(props){
		super(props)

		// получим ID объекта из URL
		let objId = props.match.params.id === undefined ? false : parseInt(props.match.params.id, 10);
		if (isNaN(objId) || objId <= 0) objId = false;

		this.state = {
			loading: true,
			objId: objId,
			data: null
		};

		this.imgThumbURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_thumb/t';
		this.imgURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img/';
	}

	//=========================================================================
	componentDidMount() {
		// получим наименование базы
		let _dbname = false;
		this.props.records.some(item => {
			if (item.id === String(this.state.objId))
			{
				_dbname = item.dbname;
				return true;
			}

			return false;
		})

		// если база неизвестна
		if (!_dbname)
		{
			this.setState({ loading: false });
			return;
		}

		axios.get(CONSTANTS.API_URL + '/obj/' + CONSTANTS.CITY_ID + '/' + _dbname + '/' + this.state.objId)
			.then(response => {
				this.setState({ data: response.data });
			})
			.catch(error => {
				this.setState({ data: null });
			})
			.then(() => {
				this.setState({ loading: false });
			});
	}

	//=========================================================================
	render() {
		if (this.state.loading)
		{
			return (
				<div className="page-content">
					<div className="load-block">
						<img src={ loadIcon } alt="Загрузка данных..." />
					</div>
				</div>
			);
		}
		else
		{
			if (!this.state.objId || !this.state.data)
			{
				return (
					<div className="page-content">
						<div className="load-block">Объект не найден...</div>
					</div>
				);
			}

			return (
				<div className="page-content">

					<h2>{ String(CONSTANTS.SALES[this.state.data.obj.sale]) + ' - ' + Helper.formatDate(this.state.data.obj.modified_date) }</h2>
					<div>
						<strong>Категория:</strong> { String(this.state.data.obj.estate_type).toLowerCase() }
						<br/>
						<strong>Комнат:</strong> { Helper.formatRoomValue(this.state.data.obj.room_quantity) }
						<br/>
						<strong>Стоимость:</strong> { Helper.formatPriceValue(this.state.data.obj) }
					</div>
					<br/>
					<Gallery
						enableImageSelection={ false }
						rowHeight={ 80 }
						images={
							this.state.data.img.map(item => {
								return {
									src: this.imgURL + item.item,
	        						thumbnail: this.imgThumbURL + item.item
	        					}
							})
						}
					/>


				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default View;
///////////////////////////////////////////////////////////////////////////////