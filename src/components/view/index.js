///////////////////////////////////////////////////////////////////////////////
import React, { Component } from 'react';
import { YMaps, Map, Placemark } from 'react-yandex-maps';
import loadIcon from '../../asset/img/loading-hor16.gif';

import Checkbox from 'material-ui/Checkbox';
import Visibility from 'material-ui/svg-icons/communication/location-on';
import VisibilityOff from 'material-ui/svg-icons/communication/location-off';
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
			objectId: null,
			objectDb: null,
			loading: true,
			data: null,
			showSame: true,
			sameObjects: []
		};

		// обработчик кликов для всего документа
		this.clickEvent = e => {
			// если кликнули по ссылке в балуне
			if (e.target.tagName === 'SPAN' && e.target.className === 'balloon-link' &&
				e.target.dataset && e.target.dataset.path)
			{
				this.props.history.replace(e.target.dataset.path);
				return false;
			}
		}

		// константы
		this.imgThumbURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_thumb/t';
		this.imgURL = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img/';
		this.imgAgent = 'https://n1.realty/ivn/' + CONSTANTS.CITY_ID + '/img_agent/';
	}

	//=========================================================================	
	componentDidMount() {
		// установим обработчик кликов
		document.addEventListener('click', this.clickEvent);

		// получим ID объекта и название базы из URL
		let objId = this.props.match.params.id === undefined ? false : parseInt(this.props.match.params.id, 10);
		if (isNaN(objId) || objId <= 0) objId = false;

		let objDb = this.props.match.params.org === undefined ? false : String(this.props.match.params.org);

		// если чего то из них нет
		if (!objId || !objDb)
		{
			this.setState({ loading: false });
			return;
		}

		axios.get(CONSTANTS.API_URL + '/obj/' + CONSTANTS.CITY_ID + '/' + objDb + '/' + objId)
			.then(response => {
				if (response && typeof response === 'object' && response.data)
				{
					if (this.props.records && this.props.records.length)
					{
						let sameObjects = this.getSameObjects(response.data, this.props.records);
						this.setState({ data: response.data, showSame: true, sameObjects: sameObjects, loading: false, objectId: objId, objectDb: objDb });
					}
					else this.setState({ data: response.data, showSame: true, sameObjects: [], loading: false, objectId: objId, objectDb: objDb });
				}
			})
			.catch(error => {
				this.setState({ data: null, loading: false });
			});
	}

	//=========================================================================
	componentWillReceiveProps(nextProps) {
		// получим ID объекта и название базы из URL
		let objId = this.props.match.params.id === undefined ? false : parseInt(this.props.match.params.id, 10);
		if (isNaN(objId) || objId <= 0) objId = false;

		let objDb = this.props.match.params.org === undefined ? false : String(this.props.match.params.org);

		// если это новый объект
		if (this.state.objectId !== objId || this.state.objectDb !== objDb)
		{
			// загрузим данные для нового объекта
			axios.get(CONSTANTS.API_URL + '/obj/' + CONSTANTS.CITY_ID + '/' + objDb + '/' + objId)
				.then(response => {
					if (this.props.records && this.props.records.length)
					{
						let sameObjects = this.getSameObjects(response.data, this.props.records);
						this.setState({ data: response.data, showSame: true, sameObjects: sameObjects, loading: false, objectId: objId, objectDb: objDb });
					}
					else this.setState({ data: response.data, showSame: true, sameObjects: [], loading: false, objectId: objId, objectDb: objDb });
				})
				.catch(error => {
					this.setState({ data: null, loading: false });
				});

			// на этом все
			return;
		}		


		// пришли данные от родителя
		if (!nextProps.loading &&
			this.state.data && typeof this.state.data === 'object' && this.state.data.obj &&
			nextProps.records && nextProps.records.length &&
			this.state.showSame)
		{
			let sameObjects = this.getSameObjects(this.state.data, this.props.records);
			this.setState({ sameObjects: sameObjects });
		}
	}

	//=========================================================================
	componentWillUnmount() {
		// уберем обработчик
		document.removeEventListener('click', this.clickEvent);
	}

	//=========================================================================
	getSameObjects(targetObject, Records) {
		// список похожих объектов по умолчанию
		let sameObjects = [];

		// если нужно показать похожие объекты - заполним список
		if (targetObject && targetObject.obj && Records)
		{
			// определим границу по стоимости
			let max = targetObject.obj.prep_price + targetObject.obj.prep_price * 0.1;
			let min = targetObject.obj.prep_price - targetObject.obj.prep_price * 0.1;

			Records.forEach(obj => {
				// если столько же комнат
				// и сумма в пределах 10%
				if (String(obj['room_quantity']) === String(targetObject.obj.room_quantity) &&
					(min <= obj['prep_price'] && obj['prep_price'] <= max))
					// добавим только если это не объект который мы просматриваем
					if (obj['id'] !== targetObject.obj.id)
						sameObjects.push(obj);
			});
		}

		return sameObjects;
	}

	//=========================================================================
	swicthShowSame(newValue) {
		// список похожих объектов по умолчанию
		let sameObjects = []

		// если нужно показать похожие объекты - заполним список
		if (newValue && this.state.data && this.state.data.obj)
		{
			sameObjects = this.getSameObjects(this.state.data, this.props.records);
		}

		this.setState({ showSame: newValue, sameObjects: sameObjects });
	}

	//=========================================================================
	initYmaps(ymaps) {
		// запишем инстанс яндекс карт
		if (!ymaps) return;
		// только когда он будет инициализирован
		this.Ymaps = ymaps;
	}

	//=========================================================================
	createObjects(map) {
		// добавляем свой кластерер
		if (!map || !this.Ymaps) return;
		if (!this.state.showSame) return;

		// круг с радиусом в 500м
		let circle = new this.Ymaps.Circle(
			[[parseFloat(this.state.data.obj.latitude), parseFloat(this.state.data.obj.longitude)], 700],
			null,
			{ draggable: false, fillOpacity: 0.1 }
		);
		// на карту его сразу
		map.geoObjects.add(circle);

		/*
		// свой макет балуна для кластирезатора
		let customBalloonContentLayout = this.Ymaps.templateLayoutFactory.createClass([
			'<h3>{{ properties.geoObjects[0].properties.balloonContentHeader|raw }}</h3>',
			'{% for geoObject in properties.geoObjects %}',
			'<div class="clusterer-balloon">{{ geoObject.properties.balloonContentBody | raw }}</div>',
			'{% endfor %}',
		].join(''));

		// кластеризатор - группирует метки
		let clusterer = new this.Ymaps.Clusterer({
			preset: 'islands#invertedVioletClusterIcons',
			clusterOpenBalloonOnClick: true,
			clusterBalloonContentLayout: customBalloonContentLayout
		});
		*/

		// метки и их координаты
		let placemarks = [];

		// добавим похожие
		this.state.sameObjects.forEach((item, idx) => {
			if (item.latitude && item.longitude)
			{
				// метка
				let placemark = new this.Ymaps.Placemark(
					[
						parseFloat(item.latitude),
						parseFloat(item.longitude)
					],
					{
						balloonContentHeader: CONSTANTS.CITY_NAME + ', ' + Helper.formatAdresValue(item),
						balloonContentBody: Helper.balloonInfo(item),
						placemarkId: idx
					},
					{
						preset: 'islands#violetCircleDotIcon'
					}
				);
				placemarks.push(placemark);
			}
		});

		let objects = this.Ymaps.geoQuery(placemarks);
		// Найдем объекты, попадающие в видимую область - круг
		let objectsInsideCircle = objects.searchInside(circle);
        // И затем добавим найденные объекты на карту.
        objectsInsideCircle.addToMap(map);

        /*
        // количество найденых объектов
        console.log(objectsInsideCircle.getLength())

		// собираем все на карте
		clusterer.add(objectsInsideCircle);
		map.geoObjects.add(clusterer);
		*/
	}

	//=========================================================================
	renderMap() {
		if (this.state.data.obj.latitude && this.state.data.obj.longitude)
		{
			let mapState = Object.assign({}, CONSTANTS.YandexMAP[CONSTANTS.CITY_ID].state);
			mapState['zoom'] = 15;
			mapState['center'] = [parseFloat(this.state.data.obj.latitude), parseFloat(this.state.data.obj.longitude)];

			return (
				<div className="view-object-map">

				<Checkbox
					checkedIcon={ <Visibility /> }
					uncheckedIcon={ <VisibilityOff /> }
					checked={ this.state.showSame }
					onCheck={ (obj, val) => this.swicthShowSame(val) }
					label="Показывать похожие в радиусе 700 м"
					style={{ margin: '20px 0' }}
				/>

				<YMaps onApiAvaliable={ ymaps => this.initYmaps(ymaps) }>
					<Map
						/* нужен рефреш при изменении одного из этих параметров */
						key={ String(this.state.showSame) + String(this.state.objectId) + String(this.state.objectDb) }
						options={{ maxZoom: 17 }}
						state={ mapState }
						width={ '100%' }
						height={ '100%' }
						instanceRef={ map => this.createObjects(map) }
					>
						<Placemark
							key="targetView"
							geometry={{ coordinates: mapState['center'] }}
							properties={{ hintContent: CONSTANTS.CITY_NAME + ', ' + Helper.formatAdresValue(this.state.data.obj) }}
							options={{ preset: 'islands#greenDotIcon' }}
						/>
					</Map>
				</YMaps>
				</div>
			);
		}

		return false;
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

					<div className="object-info">
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

					{ this.renderMap() }

				</div>
			);
		}
	}

	//=========================================================================
}
///////////////////////////////////////////////////////////////////////////////
export default View;
///////////////////////////////////////////////////////////////////////////////