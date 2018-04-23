///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import loadIcon from '../../asset/img/loading-hor16.gif';
///////////////////////////////////////////////////////////////////////////////
import axios from 'axios';
import * as CONSTANTS from '../../config';
import Helper from '../../helper';
import Gallery from '../lightbox';
///////////////////////////////////////////////////////////////////////////////
import './style.css';
///////////////////////////////////////////////////////////////////////////////
class View extends Component {
	//=========================================================================
	constructor(props){
		super(props)

		this.state = {
			loading: true,
			data: null
		};

		this.imgThumbURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_thumb/t';
		this.imgURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img/';
		this.imgAgent = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_agent/';
	}

	//=========================================================================
	componentWillMount() {
		// получим ID объекта и название базы из URL
		let objId = this.props.match.params.id === undefined ? false : parseInt(this.props.match.params.id, 10);
		if (isNaN(objId) || objId <= 0) objId = false;

		let objDb = this.props.match.params.org === undefined ? false : String(this.props.match.params.org);

		axios.get(CONSTANTS.API_URL + '/obj/' + CONSTANTS.CITY_ID + '/' + objDb + '/' + objId)
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
				<div className="page-content view">
					<div className="load-block">
						<img src={ loadIcon } alt="Загрузка данных..." />
					</div>
				</div>
			);
		}
		else
		{
			if (!this.state.data)
			{
				return (
					<div className="page-content view">
						<div className="load-block">Объект не найден...</div>
					</div>
				);
			}

			let _imgs = this.state.data.img.map(item => {
				return {
					src: this.imgURL + item.item,
	        		thumb: this.imgThumbURL + item.item
	        	}
			});

			let _adres = false;
			if (this.state.data.obj.estate_type && this.state.data.obj.estate_type.toLowerCase().indexOf('кварт') > -1)
				_adres = Helper.formatAdresValue(this.state.data.obj);

			let _square = Helper.formatSquareValue(this.state.data.obj);

			return (
				<div className="page-content view">

					<Gallery images={ _imgs } />

					<div className="info">
						<div className="object-block">
							<span><strong>Сделка:</strong> { String(CONSTANTS.SALES[this.state.data.obj.sale]).toLowerCase() }</span>
							<span><strong>Объект:</strong> { String(this.state.data.obj.estate_type).toLowerCase() }</span>
							<span><strong>Комнат:</strong> { this.state.data.obj.room_quantity }</span>
							{
								_square
								? (<span><strong>Площадь:</strong> { _square }</span>)
								: false
							}
							<span><strong>Стоимость:</strong> { Helper.formatPriceValue(this.state.data.obj) }</span>
							{
								_adres
								? (<span><strong>Адрес:</strong> { _adres }</span>)
								: false
							}
							<span><strong>Старт рекламы:</strong> { Helper.formatDate(this.state.data.obj.modified_date) }</span>
						</div>

						<div className="agent-block">
							{
								this.state.data.obj.agent_photo
								? (<img src={ this.imgAgent + this.state.data.obj.agent_photo } alt="" />)
								: false	
							}							
							<div>
								<strong>{ this.state.data.obj.agent_first_name + ' ' + this.state.data.obj.agent_patronym }</strong>
								<br/>
								Консультант
								<h3><a href={ "tel:" + this.state.data.obj.agent_phone_mobile }>{ this.state.data.obj.agent_phone_mobile }</a></h3>
							</div>
						</div>
					</div>

				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default View;
///////////////////////////////////////////////////////////////////////////////