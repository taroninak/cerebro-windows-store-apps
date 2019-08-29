const shell = require('node-powershell');
const { memoize } = require('cerebro-tools')
const { shellCommand }  = require('cerebro-tools');

const systemApps = [
    'InsiderHub',
    'CortanaListenUIApp',
    'EnvironmentsApp',
    'HoloCamera',
    'HoloInemPlayerApp',
    'Microsoft.MicrosoftEdge',
    'Microsoft.PPLProjection',
    'Microsoft.Windows.Coratana',
    'Microsoft.Windows.HolographicFirstRun',
    'ContactSupport',
    'Microsoft.XboxGameCallableUI',
    'Microsoft.Windows.SecondaryTileExperience'
].map(el => el.toLowerCase());

const normalize = (string => {
   return string
        .replace(/\r/g, '')
        .split('\n\n')
        .filter(el => el && el.trim())
        .map(el => el.split('\n')
            .filter(s => s && s.trim() && s.includes(':'))
            .reduce((object, s) => {
                const [key, value] = s.trim().split(':');
                return Object.assign(object, {
                    [key.trim()]: value.trim()
                });
            }, {}))
        .filter(el => el.SignatureKind == 'Store')
        .filter(el => !systemApps.includes(el.Name.toLowerCase()))
        .map(el => {
            const name = el.Name.replace(/(\w+)App/, '$1')
            .replace('Microsoft', '')
            .replace(/Windows(?!\w)/, '') //fix name not full begin with "Windows", like WindowsTerminal
            .replace(/\.+/, '.')
            .split('.');

            const title = name[1] || name[0];
            return {
                title, 
                package: el.PackageFamilyName
            };
        })
})

exports.getApps = memoize(() => {
    const ps = new shell({
        executionPolicy: 'Bypass',
        noProfile: true
    });

    ps.addCommand('Get-AppxPackage');

    return ps.invoke()
			.then(normalize)
			.then((result) => {
				setTimeout(() => {
					try {
						ps.dispose();
					} catch(e) {}
				}, 10);
				return result;
			});
});

exports.startApp = ((packageName) => {
    if(packageName.includes('.Slack')) {
        return shellCommand('start slack')
    }
    shellCommand(`start shell:AppsFolder\\${packageName}!App`);
})
