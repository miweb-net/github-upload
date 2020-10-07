var WshShell = new ActiveXObject("WScript.Shell");
var fso = new ActiveXObject("Scripting.FileSystemObject");

function Unzip(source, target)
{
	WScript.Echo("    Unzipping file " + source + " to " + target);
	var appshell = new ActiveXObject("Shell.Application");
	var zipfiles = appshell.NameSpace(source).items();
	appshell.Namespace(target).CopyHere(zipfiles);
}

function DoDownload(url, to_file)
{
	WScript.Echo("    Downloading " + url + " to " + to_file);
	try
	{
		var install = "curl.exe -o " + to_file + " " + url;
		WshShell.run(install, 2, 1);
		return 1;	// Successful download.
	}
	catch (err)
	{
		WScript.Echo("    Chrome download error: " + err.message);
		return 0;	// Failure to download.
	}
}

var home = WshShell.ExpandEnvironmentStrings("%USERPROFILE%");
var root_url = "http://weebly.simulation.com/Downloads";
var url = root_url + "/GoogleChromeEnterpriseBundle64.zip";

DoDownload(url + '.00', 'chrome.zip.00');
DoDownload(url + '.01', 'chrome.zip.01');

// Combine the files we just downloaded
var combine_command = 'C:\\Program Files\\Python38\\python.exe combine.py';
combine_command += ' chrome.zip chrome.zip';
WshShell.run(combine_command, 2, 1);

// Prepare the unzip the file into a separate folder.
var curr_dir = WshShell.CurrentDirectory;
var unzip_folder = curr_dir + '\\Chrome_installer';
// Create the unzip target folder if it doesn't exist.
if ( !fso.FolderExists(unzip_folder) )
	fso.CreateFolder(unzip_folder);

// Must supply full paths to the Unzip function.
Unzip(curr_dir + '\\chrome.zip', unzip_folder);

var chrome_exe = "Chrome_Installer/Installers/GoogleChromeStandaloneEnterprise64.msi";
if ( fso.FileExists(chrome_exe) )
{
	WScript.Echo("    Google Chrome installer expansion successful");
	fso.MoveFile(chrome_exe, "GoogleChromeStandaloneEnterprise64.msi");
}
else
{
	WScript.Echo("    Google Chrome installer expansion failed");
	WScript.Quit(-1);
}

WScript.Echo("    Running MsiExec.exe /i GoogleChromeStandaloneEnterprise64.msi /qn");
var exCmd = WshShell.Exec("MsiExec.exe /i googlechromestandaloneenterprise64.msi /qn");

WScript.StdOut.Write("    ");
while ( exCmd.Status == 0 )
{
	WScript.StdOut.Write(".");
	WScript.Sleep(700);
}
WScript.Echo("\n    Google Chrome Installation complete");
