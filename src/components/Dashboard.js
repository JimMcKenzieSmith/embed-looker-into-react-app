import React from "react";
import Hmac from "crypto";
import { stringify } from "querystring";

const Dashboard = (props) => {
    const url = sample();
    return (
        <iframe src={url} height="700" width="900">
        </iframe>
    );
};

function nonce(len) {
    let text = "";
    const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < len; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
}

function forceUnicodeEncoding(string) {
    return decodeURIComponent(encodeURIComponent(string));
}

function created_signed_embed_url(options) {
    // looker options
    const secret = options.secret;
    const host = options.host;

    // user options
    const json_external_user_id = JSON.stringify(options.external_user_id);
    const json_first_name = JSON.stringify(options.first_name);
    const json_last_name = JSON.stringify(options.last_name);
    const json_permissions = JSON.stringify(options.permissions);
    const json_models = JSON.stringify(options.models);
    const json_group_ids = JSON.stringify(options.group_ids);
    const json_external_group_id = JSON.stringify(options.external_group_id || "");
    const json_user_attributes = JSON.stringify(options.user_attributes || {});
    const json_access_filters = JSON.stringify(options.access_filters);

    // url/session specific options
    const embed_path = '/login/embed/' + encodeURIComponent(options.embed_url);
    const json_session_length = JSON.stringify(options.session_length);
    const json_force_logout_login = JSON.stringify(options.force_logout_login);

    // computed options
    const json_time = JSON.stringify(Math.floor((new Date()).getTime() / 1000));
    const json_nonce = JSON.stringify(nonce(16));

    // compute signature
    let string_to_sign = "";
    string_to_sign += host + "\n";
    string_to_sign += embed_path + "\n";
    string_to_sign += json_nonce + "\n";
    string_to_sign += json_time + "\n";
    string_to_sign += json_session_length + "\n";
    string_to_sign += json_external_user_id + "\n";
    string_to_sign += json_permissions + "\n";
    string_to_sign += json_models + "\n";
    string_to_sign += json_group_ids + "\n";
    string_to_sign += json_external_group_id + "\n";
    string_to_sign += json_user_attributes + "\n";
    string_to_sign += json_access_filters;

    const signature = Hmac.createHmac('sha1', secret).update(forceUnicodeEncoding(string_to_sign)).digest('base64').trim();

    // construct query string
    const query_params = {
        nonce: json_nonce,
        time: json_time,
        session_length: json_session_length,
        external_user_id: json_external_user_id,
        permissions: json_permissions,
        models: json_models,
        access_filters: json_access_filters,
        first_name: json_first_name,
        last_name: json_last_name,
        group_ids: json_group_ids,
        external_group_id: json_external_group_id,
        user_attributes: json_user_attributes,
        force_logout_login: json_force_logout_login,
        signature: signature
    };

    const query_string = stringify(query_params);

    return host + embed_path + '?' + query_string;
}



function sample() {
    const fifteen_minutes = 15 * 60;

    const LOOKER_EMBED_SECRET = process.env.REACT_APP_LOOKER_EMBED_SECRET;
    const LOOKER_HOST = process.env.REACT_APP_LOOKER_HOST;
    const LOOKER_MODEL = process.env.REACT_APP_LOOKER_MODEL;

    const url_data = {
        host: LOOKER_HOST,
        secret: LOOKER_EMBED_SECRET,
        external_user_id: '57',
        first_name: 'Jim',
        last_name: 'Smith',
        group_ids: [4],
        external_group_id: 'awesome_engineers',
        permissions: ['see_user_dashboards', 'see_lookml_dashboards', 'access_data', 'see_looks'],
        models: [LOOKER_MODEL],
        access_filters: {
            fake_model: {
                id: 1
            }
        },
        user_attributes: { "an_attribute_name": "my_attribute_value", "school_id": "1234" },
        session_length: fifteen_minutes,
        embed_url: "/embed/dashboards-next/28",
        force_logout_login: true
    };

    const url = created_signed_embed_url(url_data);
    return "https://" + url;
}


export default Dashboard;