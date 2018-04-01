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
	componentDidMount() {
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
			if (this.state.data.obj.estate_type && this.state.data.obj.estate_type.toLowerCase() === 'квартира')
			{
				_adres = [];
				if (this.state.data.obj.street) _adres.push('ул. ' + this.state.data.obj.street.trim());
				if (this.state.data.obj.house_no) _adres.push('д. ' + this.state.data.obj.house_no);
			}

			return (
				<div className="page-content view">
					<br/>
					<div>
						<strong>Тип сделки:</strong> { String(CONSTANTS.SALES[this.state.data.obj.sale]).toLowerCase() }
						<br/>
						<strong>Категория:</strong> { String(this.state.data.obj.estate_type).toLowerCase() }
						<br/>
						<strong>Комнат:</strong> { this.state.data.obj.room_quantity }
						<br/>
						<strong>Стоимость:</strong> { Helper.formatPriceValue(this.state.data.obj) }
						{
							_adres && _adres.length
							? (<span>
								<br/>
								<strong>Адрес:</strong> { _adres.join(', ') }
								</span>)
							: false
						}
						<br/>
						<strong>Старт рекламы:</strong> { Helper.formatDate(this.state.data.obj.modified_date) }
					</div>
					<br/>
					<Gallery images={ _imgs } />

					<div className="agent-block">
						<img src={ this.imgAgent + this.state.data.obj.agent_photo } alt="" />
						<strong>{ this.state.data.obj.agent_first_name + ' ' + this.state.data.obj.agent_patronym }</strong>
						<br/>
						Консультант
						<h3><a href={ "tel:" + this.state.data.obj.agent_phone_mobile }>{ this.state.data.obj.agent_phone_mobile }</a></h3>
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