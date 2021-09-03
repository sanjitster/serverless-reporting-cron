import { getConfig } from '../handler';
import { AuthService, ITokenResponse } from '@giift/auth-services';
import { IErrorResponseData, ApiService } from '@giift/api-services';
import moment from 'moment';

export interface IGiiftReport {
  scope: string;
  report: string;
  input: IGiiftReportInput[]
}

export interface IGiiftReportInput {
  name: string;
  value: string;
}

export interface ITokenCronResponse extends ITokenResponse {
  baseUrl: string;
}

export interface IGiiftReportClean {
  data: any[];
  suggested_filename: string;
}

/**
 * Establishes valid Giift session with the getToken api
 * 
 * @param scope string
 */
const getToken = async (scope: string): Promise<ITokenCronResponse | IErrorResponseData> => {
  return await getConfig().then((data) => {
    const auth = new AuthService(data.baseUrl);
    return new Promise((resolve, reject) => {
      // console.log({
      //   client_id: data.clientId,
      //   client_secret: data.clientSecret,
      //   grant_type: 'client_credentials',
      //   scope
      // });
      auth.GetToken({
        client_id: data.clientId,
        client_secret: data.clientSecret,
        grant_type: 'client_credentials',
        scope
      }).then(
        (token: ITokenCronResponse) => {
          token.baseUrl = data.baseUrl;
          resolve(token);
        })
        .catch(error => reject(error));
    });
  });
};

/**
 * Builds proper validated inputs for api calls.
 * 
 * @param inputs IGiiftReportInput[]
 */
const cleanInputs = (inputs: IGiiftReportInput[]): IGiiftReportInput[] => {
  return inputs.map((d) => {
    if (d.name === 'from' || d.name === 'to') {
      if (d.value === '_yesterday') {
        d.value = moment().add(-1, 'days').format('YYYY-MM-DD').toString();
      } else if (d.value === '_today') {
        d.value = moment().format('YYYY-MM-DD').toString();
      } else if (d.value === '_previous_month_start') {
        d.value = moment().subtract(1, 'months').startOf('month').format('YYYY-MM-DD').toString();
      } else if (d.value === '_previous_month_end') {
        d.value = moment().subtract(1, 'months').endOf('month').format('YYYY-MM-DD').toString();
      } else if (d.value === '_current_month_start') {
        d.value = moment().startOf('month').format('YYYY-MM-DD').toString();
      } else if (d.value === '_current_month_end') {
        d.value = moment().endOf('month').format('YYYY-MM-DD').toString();
      } else {
        if (!moment(d.value, 'YYYY-MM-DD').isValid()) {
          d.value = '';
        }
      }
    }
    return d;
  });
};

/**
 * Maps columns to data
 * @param data any
 */
const mapDataColumnsWithData = (data: any): IGiiftReportClean => {
  const mapped = {
    suggested_filename: data.suggested_filename.replace(/\s+/g, '_').toLowerCase() || '',
    data: data.data.map((d: any[]) => {
      let n = {};
      d.map((inner, index) => n[data.columns[index].name] = inner.toString().replace(/[\r\n]+/gm, ''));
      return n;
    })
  }
  return mapped;
};

/**
 * Executes Giift reporting api with valid token and cleaned inputs for a specific report
 * 
 * @param scope string
 * @param report string
 * @param input IGiiftReportInput[]
 */
export const getReport = async (scope: string, reportName: string, input: IGiiftReportInput[]): Promise<IGiiftReportClean> => {
  try {
    const report = await getToken(scope)
      .then((token: ITokenCronResponse) => {
        const inputs = cleanInputs(input);
        let api = `${token.baseUrl}api/report/v1/report/execute/${reportName}`;
        //
        const queryString = Object.keys(inputs).map(key => inputs[key].name + '=' + inputs[key].value).join('&');
        if (queryString !== '') {
          api = `${api}?${queryString}`;
        }
        return ApiService.get(api, {
          headers: {
            'Authorization': `Bearer ${token.access_token}`
          }
        });
      });
      console.log("Reporting Data: ", mapDataColumnsWithData(report));
    return mapDataColumnsWithData(report);
  } catch (error) {
    console.log("Reporting Data Error: ", error);
    throw new Error(error.error_description);
  }
};
