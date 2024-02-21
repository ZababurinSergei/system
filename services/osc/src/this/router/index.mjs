import { directory } from './directory/index.mjs'
import {store, normalizePathName} from '../../this/index.mjs'
let api = Symbol.for("api");

let сonfig = []

const ferDialog = document.querySelector('fer-dialog');
const errorDialog = (message) => {
    ferDialog.open = {
        type: 'error',
        title: 'Ошибка',
        description: [{
            text: message
        }],
        button: [{
            type: 'cancel',
            description: 'Ok'
        }]
    };
};


export const router = async (self, props) => {
    let result = {
        key: 0
    }

    const route = сonfig.find(item => {
        if(props?.value) {
            if(props.value === item.value) {
                return true
            }
        } else {
            if(location.pathname.startsWith(item.pathName)) {
                return true
            }
        }
    })

    const params = window.location.pathname.replace(route ? route.pathName: '/', '')

    if(route?.value) {
        props.value = route.value
    }

    result = Object.assign(result, await directory(self, props));

    return result
}


export const сonfigRouter =  {
    init: async () => {
        const isService = store.get('isService')
        let directory = undefined

        // const auth = window.localStorage.getItem('authorization')
        // const user = JSON.parse(auth)
        // if(auth !== null) {
        //     const record = await window[api].fetch.get('/api/v1/auth/userinfo', {
        //         Authorization: `Bearer ${user.token.access}`
        //     });
        //
        //     console.log('=================== USER INFO =======', record)
        // }


        if(isService) {
            directory = await window[api].fetch.get('/api/v1/directory', {
                active: true,
                showActive: true
            });
        } else {
            directory = {
                res: {
                    error: false,
                    body: []
                }
            };
        }

        const directoryId = {
            interactionId: "",
            recipientId: "",
            headerId: ""
        }

        const property = [
            {
                id: "ce97f6db-c1cb-4275-8dc9-654f91cdba05",
                icon: 'mss',
                title: 'Правила',
                name: "Правила",
                pathName: `/rule/`,
                breadcrumb: "Правила",
                key: `6`,
                value: "ce97f6db-c1cb-4275-8dc9-654f91cdba05",
                allowed: []
            },{
                id: "de712057-84e4-4439-9215-f29dd1d1519c",
                icon: 'mss',
                title: 'Подписки',
                name: 'Подписки',
                pathName: `/subscirption/`,
                breadcrumb: "Подписки",
                key: `7`,
                value: "de712057-84e4-4439-9215-f29dd1d1519c",
                allowed: []
            },{
                id: "8b20rc4b-4826-15j0-8084-72c940d5jf16",
                icon: 'mss',
                title: 'Журнал изменений',
                name: 'Журнал изменений',
                pathName: `/audit/`,
                breadcrumb: "Журнал изменений",
                key: `5`,
                value: "8b20rc4b-4826-15j0-8084-72c940d5jf16",
                allowed: []
            }, {
                icon: 'mss',
                title: 'api',
                name: 'Апи',
                pathName: `/api/`,
                breadcrumb: "api",
                key: `100`,
                value: "8b99rc4b-3426-16j0-8984-72c960d5cf16",
                allowed: []
            }, {
                icon: 'mss',
                title: 'Отправители',
                name: 'Отправители',
                pathName: `/suppliers/`,
                breadcrumb: "отправители",
                key: `6`,
                value: "8l99tl4b-3426-16k0-8984-72r960w5ix16",
                allowed: []
            }
        ]

        /*

         */
        if(directory.res.error) {
            errorDialog(directory.res.obj.description);
            сonfig = property
            return false
        } else {
            let routes = []

            const permissions = store.get('authorization').rights.permissions

            for (let i = 0; i < directory.res.body.length; ++i) {
                let rights = permissions.find(item => item.directoryId === directory.res.body[i].id)
                // console.log('Найденные права:', rights, 'Раздел: ',directory.res.body[i], 'все права: ', permissions)
                rights = rights.rights.map(item => item.rightName)
                if(directory.res.body[i].pathName === "system") {
                    directoryId.recipientId = directory.res.body[i].id
                } else if(directory.res.body[i].pathName ===  "interaction") {
                    directoryId.interactionId = directory.res.body[i].id
                } else if(directory.res.body[i].pathName === "header_message") {
                    directoryId.headerId = directory.res.body[i].id
                }

                routes.push({
                    icon: 'mss',
                    title: 'Справочник',
                    rights: rights,
                    name: directory.res.body[i].name,
                    pathName: `/${directory.res.body[i].pathName}/`,
                    breadcrumb: "Справочник",
                    key: "0",
                    value: directory.res.body[i].id
                })
            }

            let count = routes.length

            for (let item of property) {
                let rights = (permissions.find(data => data.directoryId === item.id))?.rights
                if(rights) {
                    rights = rights.map(item => item.rightName)
                } else {
                    rights = []
                }

                routes.push({
                    icon: 'mss',
                    title: `${item.title}`,
                    rights: rights,
                    name: `${item.name}`,
                    pathName: `${item.pathName}`,
                    breadcrumb: `${item.breadcrumb}`,
                    key: `${item.key.toString()}`,
                    value: `${item.value}`
                })

                count = count + 1
            }

            for(let item of routes) {
                item.directory = directoryId
            }

            сonfig = routes

            console.log('ROUTES: ', routes)
        }

        if (location.pathname === '/') {
            if(сonfig.length !== 0) {
                history.pushState(сonfig[0].title, '', `${normalizePathName(сonfig[0].pathName)}`);
            }
        } else {
            history.pushState(сonfig[0].title, '', `${normalizePathName(location.pathname)}`);
        }

        return  true
    },
    get: () => сonfig
}